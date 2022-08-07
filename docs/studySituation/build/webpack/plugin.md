# plugin

## 剖析

plugin 是一个具有 `apply` 方法的 js 对象，`apply` 方法会传入 webpack compiler 对象。

`Compiler`模块是 webpack 的主要引擎，webpack 从开始到结束，`Compiler` 只会实例化一次。`compiler` 对象记录了 webpack 运行环境的所有的信息，插件可以通过它获取到 webpack 的配置信息。

`Compilation` 模块会被 `Compiler` 用来创建新的 `compilation` 对象（或新的 build 对象）。 `compilation` 对象能够访问所有的模块和它们的依赖（大部分是循环依赖）。在 watch 模式下启动 webpack，只要项目文件有改动，`compilation` 就会被重新创建。

## banner-webpack-plugin

在输出模块的内容前添加前缀信息

```js
const path = require("path");
/**
 * 在输出的打包文件前添加一段注释的功能
 * 1. 何时? compiler.emit 在输出 asset 到 output 目录之前执行
 * 2. 获取资源? compilation.assets 记录了资源
 */
module.exports = class BannerWebpackPlugin {
	/**
	 *
	 * @param {import('webpack').Compiler} compiler
	 */
	apply(compiler) {
		compiler.hooks.emit.tap("BannerWebpackPlugin", compilation => {
			const exts = [".js", ".css"];
			// compilation.assets 是一个代理对象，里面保存着资源，
			// 属性：资源路径，属性值：包含资源内容和大小的对象
			for (const name in compilation.assets) {
				if (Object.hasOwnProperty.call(compilation.assets, name)) {
					if (exts.includes(path.extname(name))) {
						// souce 方法的返回值就是文件内容
						const assetCtn = compilation.assets[name].source();
						// 作者名可以通过实例化的时候传进来配置进行指定
						const newCtx = `/*\r\n * Author: FBIConan\r\n */\r\n` + assetCtn;
						compilation.assets[name] = {
							source() {
								return newCtx;
							},
							// size 方法返回值记录内容长度
							size: () => newCtx.length,
						};
					}
				}
			}
		});
	}
};
```

## analyze-webpack-plugin

分析所有打包输出的文件(模块)大小，并创建相应的 md 文件

```js
/**
 * 分析打包输出的文件大小。并生成相应额 md 文件
 * 1. 获取输出打包文件? compiler.hooks.emit 钩子中 compilation.assets 中
 * 2. 创建新的文件? fs? no! 直接在 compilation.assets 中添加新的属性，webpack 会自动创建
 */
module.exports = class AnalyzeWebpackPlugin {
	/**
	 *
	 * @param {import("webpack").Compiler} compiler
	 */
	apply(compiler) {
		compiler.hooks.emit.tap("AnalyzeWebpackPlugin", compilation => {
			// 1. 遍历所有即将输出的资源，获取其大小
			const mdContent = Object.entries(compilation.assets).reduce(
				(mdCtnTemp, asset) => {
					const assetFormat = `\r\n| ${asset[0]} | ${asset[1].size() / 1024} |`;
					return mdCtnTemp + assetFormat;
				},
				`| 文件路径 | 文件大小（kb） |\r\n| --- | --- |`
			);
			// 直接往 compilation.assets 中添加属性，webpack 会帮忙创建文件
			compilation.assets["analyze.md"] = {
				source() {
					return mdContent;
				},
				size() {
					return mdContent.length;
				},
			};
		});
	}
};
```

## clean-webpack-plugin

本次打包时清除上一次的打包内容

```js
/**
 * 每次打包输出新的内容时，清除上一次输出的打包内容
 * 1. 何时? 在新的打包内容输出之前（防止打包报错未输出打包内容却清除了上次的打包内容的情况发生）
 * 2. 目录? compiler.outputPath / compiler.options.output.path
 * 3. 如何清除目录? compiler.outputFileSystem
 */
module.exports = class CleanWebpackPlugin {
	constructor() {
		// 每次 webpack 的运行期间只清理一次，防止搭配 devServer 使用时出现清理了有效文件的问题
		this.initialClean = false;
	}
	/**
	 *
	 * @param {import("webpack").Compiler} compiler
	 */
	apply(compiler) {
		// 1. 注册钩子
		compiler.hooks.emit.tap("CleanWebpackPlugin", compilation => {
			// 2. 获取文件打包目录
			compiler.outputPath;
			// 3. 通过 webpack 提供的 fs 删除目录
			console.log(compiler.outputPath);
			this.deleteDir(compiler.outputFileSystem, compiler.outputPath);
		});
	}
	/**
	 *
	 * @param {import("webpack").Compiler["outputFileSystem"]} fs
	 * @param {string} path
	 */
	deleteDir(fs, path) {
		// 判断该路径是否存在 或者 是否已经清理过
		if (!fs.existsSync(path) || this.initialClean) {
			return;
		}
		// 删除目录必须先删除目录下的所有文件
		const pathChildren = fs.readdirSync(path);
		pathChildren.forEach(pathChild => {
			// 判断是否是文件夹
			const absPath = path + "/" + pathChild;
			const stat = fs.statSync(absPath);
			const isDir = stat.isDirectory();

			if (isDir) {
				// 文件夹 递归处理
				this.deleteDir(fs, absPath);
			} else if (stat.isFile()) {
				// 文件 直接删除
				fs.unlinkSync(absPath);
			}
		});
		this.initialClean = true;
	}
};
```

## inline-chunk-webpack-plugin

将 runtime 文件内容直接作为 html 文件的内联 script

```js
/**
 * 将体积较小的 runtime.js 文件变成 html 文件内联的 script，以减少请求次数
 * 		使用 html-webpack-plugin 提供的钩子进行操作 alterAssetTagGroups afterEmit
 */

// you can use https://github.com/tallesl/node-safe-require instead:
const HtmlWebpackPlugin = require("safe-require")("html-webpack-plugin");

class InlineChunkWebpackPlugin {
	constructor() {
		this.deleteFiles = new Set();
	}
	apply(compiler) {
		compiler.hooks.compilation.tap("InlineChunkWebpackPlugin", compilation => {
			// 1. 获取 html-webpack-plugin 的 hooks
			const hwpHooks = HtmlWebpackPlugin.getHooks(compilation);
			// 2. 注册 html-webpack-plugin 的 hook -> alterAssetTagGroups
			hwpHooks.alterAssetTagGroups.tap(
				"InlineChunkWebpackPlugin", // <-- Set a meaningful name here for stacktraces
				data => {
					// 3. 从里面将 script 的 runtime 文件，变成 inline script
					data.headTags = this.refitToInline(data.headTags, compilation.assets);
					data.bodyTags = this.refitToInline(data.bodyTags, compilation.assets);
				}
			);

			hwpHooks.afterEmit.tap("InlineChunkWebpackPlugin", () => {
				this.deleteFiles.forEach(file => delete compilation.assets[file]);
			});
		});
	}
	refitToInline(tags, assets) {
		return tags.map(tag => {
			// 只处理 script 标签并且是 runtime 文件
			if (
				tag.tagName !== "script" ||
				!/runtime(.*).js/.test(tag.attributes.src)
			) {
				return tag;
			} else {
				const content = assets[tag.attributes.src].source();
				this.deleteFiles.add(tag.attributes.src);
				return {
					tagName: "script",
					innerHTML: content,
					closeTag: true,
				};
			}
		});
	}
}

module.exports = InlineChunkWebpackPlugin;
```
