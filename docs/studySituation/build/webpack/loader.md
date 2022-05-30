# loader

## 使用方式

1. 配置方式：在 webpack.config.js 文件中指定 loader

具有 `pre` `normal(默认)` `post` 三种形式，通过 `enforce` 属性进行配置

```js
// webpack.config.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				enforce: "pre",
				use: ["babel-loader"],
			},
		],
	},
};
```

2. 内联方式：在每个 `import` 语句中显式指定 loader

```js:no-line-numbers
import Styles from "style-loader!css-loader?modules!./styles.css";
```

通过为内联 import 语句添加前缀，可以覆盖配置中的所有 normalLoader, preLoader 和 postLoader：

- 使用 ! 前缀，将禁用所有已配置的 normal loader(普通 loader)

  ```js:no-line-numbers
  import Styles from "!style-loader!css-loader?modules!./styles.css";
  ```

- 使用 !! 前缀，将禁用所有已配置的 loader（preLoader, loader, postLoader）

  ```js:no-line-numbers
  import Styles from "!!style-loader!css-loader?modules!./styles.css";
  ```

- 使用 -! 前缀，将禁用所有已配置的 preLoader 和 loader，但是不禁用 postLoaders

  ```js:no-line-numbers
  import Styles from "-!style-loader!css-loader?modules!./styles.css";
  ```

::: tip loader 的执行顺序

1. 同级 loader 从右到左，从上到下
2. 非同级 `pre` -> `normal` -> `inline` -> `post`

:::

## loader 的类型

loader 是一个函数，运行在 `node.js` 中。

- 同步 loader

```js
/**
 * 同步 loader，直接通过 return 返回处理过的内容或者调用 this.callback 方法返回处理过的内容及其他参数
 * @param {string|Buffer} content 源文件的内容
 * @param {object} [map] 可以被 https://github.com/mozilla/source-map 使用的 SourceMap 数据
 * @param {any} [meta] meta 数据，可以是任何内容
 */
module.exports = function (content, map, meta) {
	// this.callback(null, content, map, meta)  // 第一个参数是 error 的内容
	return content;
};
```

- 异步 loader

```js
/**
 * 异步 loader，必须先调用 this.async() 方法获取回调函数，然后异步执行回调函数
 */
module.exports = function (content, map, meta) {
	const callback = this.async();
	setTimeout(() => {
		callback(null, content);
	}, 1000);
};
```

- raw loader

```js
/**
 * raw loader，接收的 content 是 buffer 形式
 */
module.exports = function (content, map, meta) {
	return content;
};
// raw loader
module.exports.raw = true;
```

- pitch loader

```js
/**
 * loader 函数
 * @param {string|Buffer} content
 * @param {object} [map]
 * @param {any} [meta]
 */
module.exports = function (content, map, raw) {
	return content;
};

/**
 * pitch 方法
 * @param {string} remainRequest loader 链中排在自己后面的loader以及资源文件的绝对路径（!分隔，同 inline loader 的写法）
 */
module.exports.pitch = function (remainRequest) {
	// pitch 方法会优先于所有 loader 函数执行，且执行顺序与 loader 函数相反
	// post 优先 inline 优先 normal 优先 pre，且同级执行顺序从左往右，从上往下
	// 且一旦有某个 pitch 方法 return 了非空结果，立即跳转至上一 loader 函数
	// 即剩余 pitch 方法与对应的 loader 函数(包括自身 pitch 方法对应的 loader 函数)都跳过执行，这种称为熔断机制
	console.log("pitch");
};
```

## banner-loader

为内容打上前缀信息

```js
// loader options 的验证规则
const schema = {
	type: "object",
	properties: {
		author: {
			type: "string",
		},
	},
	additionalProperties: true, // 除了 properties 中已定义的属性，不允许额外的属性
};

module.exports = function (ctn) {
	// 获取配置中的 loader options
	const options = this.getOptions(schema);
	const prefix = `
    /**
     * author: ${options.author}
     */
  `;
	this.callback(null, prefix + ctn);
};
```

## file-loader

处理资源文件，原封不动的输出出去（emitFile）

```js
const loaderUtils = require("loader-utils");
module.exports = function (content) {
	// 根据内容生成文件名
	const interpolateName = loaderUtils.interpolateName(
		this,
		"[hash:8].[ext][query]", // 可以在 options 中配置
		{
			content,
		}
	);
	// 输出文件
	this.emitFile(interpolateName, content);
	// 返回： module.exports = "文件路径(文件名)"
	return `module.exports = "${interpolateName}"`;
};

module.exports.raw = true;
```

## babel-loader

通过 `@babel/core` 转换 js 代码至更低版本

```js
const babel = require("@babel/core");

const schema = {
	type: "object",
	properties: {
		presets: {
			type: "array",
		},
	},
	additionalProperties: true,
};

module.exports = function (ctn) {
	const options = this.getOptions(schema);
	const callback = this.async();
	// 转换代码
	babel.transform(ctn, options, (err, result) => {
		if (err) callback(err);
		else callback(null, result.code);
	});
};
```

## style-loader

通过 js 创建 style 标签，放置 css 内容进去

```js
/**
 * @param {string} remainRequest loader 链中排在自己后面的loader以及资源文件的绝对路径
 */
module.exports.pitch = function (remainRequest) {
	// **\node_modules\css-loader\dist\cjs.js!**\src\styles\index.css

	// 转换为相对路径的形式
	const relativePath = remainRequest
		.split("!")
		.map(absPath => {
			// this.context：模块（资源文件）所在的目录
			// 绝对路径转换为相对路径
			return this.utils.contextify(this.context, absPath);
		})
		.join("!");

	// 内联 import 指定 loader，使用 !! 禁用配置的 loader，防止死循环 
	const script = `
    import css from '!!${relativePath}';
    const styleRef = document.createElement('style');
    styleRef.innerHTML = css;
    document.head.append(styleRef);
  `;
	return script;
};
```
