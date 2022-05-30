# 概念

## 入口(entry)

打包的起点文件（模块）

```js
// webpack.config.js
module.exports = {
	/**
	 * @type {string}
	 */
	entry: "./src/main", // 后缀名可省略，可以由 resolve.extensions 控制后缀名种类
};

// webpack.config.js
module.exports = {
	/**
	 * @type {object}
	 */
	entry: {
		main: "./src/main",
		app: "./src/app",
	},
};
```

## 输出(output)

指定 _bundle_ 的输出位置以及命名方式：

```js
// webpack.config.js
const path = require("path");

module.exports = {
	output: {
		path: path.join(__dirname, "dist"), // 所有打包文件的输出路径（文件夹）
		filename: "js/[name].js", // 初始 js bundle 文件的输出路径
		chunkFilename: "js/[id].chunk.js", // 非初始 js chunk 的输出路径（比如动态导入）
		assetModuleFilename: "assets/[hash:10][ext][query]", // type: asset 的资源文件输出路径
	},
};
```

## loader

让 webpack 具有处理非 `.js` `.json` 类型文件的能力，并将它们转换为有效模块，以供应用程序使用。

```js
// webapck.config.js

module.exports = {
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
};
```

::: tip 上述 rule 含义：
嘿，webpack 编译器，当你碰到「在 `require()`/`import` 语句中被解析为 '.css' 的路径」时，在你对它打包之前，先 use(使用) `css-loader` 和 `style-loader` 转换一下
:::

## 插件(plugins)

插件用来提供更为强大的功能，包括打包优化、资源管理、注入环境变量。_而 loader 用于转换**某些类型**的模块_。

```js
// webpack.config.js

const HtmlPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
	plugins: [
		// 为应用程序生成一个 HTML 文件，并自动将生成的所有 bundle 注入到此文件中
		new HtmlPlugin({ template: path.join(__dirname, "public/index.html") }),
	],
};
```

## 模式(mode)

`development` `production` `none` 之一

```js
// webpack.config.js

module.exports = {
	mode: "development", // 开发模式下 js 和 html 文件内容不会被压缩，生产模式默认压缩
};
```
