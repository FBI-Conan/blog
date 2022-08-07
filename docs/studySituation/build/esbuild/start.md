# 开始

## 介绍

`esbuild` 是一个极其快速的 `js` 打包器，内部由 `Go` 语言编写，更具性能优势，`vite` 在开发模式下已经使用了 `esbuild` [预构建依赖](https://cn.vitejs.dev/guide/dep-pre-bundling.html)。`esbuild` 在针对构建应用的重要功能（代码分割、CSS 处理等）还在持续开发中，所以暂时不会将其作为生产构建器使用。

JS/原生混合工具链将会称为常态。

## 安装

```shell
npm install esbuild
```

## 打包

- 命令行的方式

```shell
npx esbuild app.jsx --bundle --outfile=out.js
```

- JS API 的方式

```js
require('esbuild')
	.build({
		entryPoints: ['app.jsx'],
		bundle: true,
		outfile: 'out.js',
		sourcemap: false,
		minify: true, // 压缩
		external: ['./node_modules/*'], // 打包时排除
	})
	.catch(() => process.exit(1));
```

`build` 函数会在子进程中执行 `esbuild`，函数在构建成功后返回一个成功的期约(Promise)。且默认任何错误信息都将在控制台打印出来。
