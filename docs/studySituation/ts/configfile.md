# 配置文件

## 编译单文件

最初级的编译一个 ts 文件方式：`tsc 文件名`，每次修改了该 ts 文件，再重新运行命令。为了便利，你可以`tsc 文件名 -w`，这样就可以监听该文件，不用手动编译了。

但是对于一个项目，那么多的文件，使用上述方式是不现实的，因此解决方案就是编写 ts 的配置文件`tsconfig.json`。

## tsconfig.json

```json
{
	/**
    tsconfig.json 是ts编译器的配置文件:

      "include" 用来指定哪些ts文件需要被编译，默认值： ["** / *"]
           通配符 **  递归匹配所有子目录
                  *  匹配零个或多个字符(不包括目录)
						      ?  匹配任意一个字符(不包括目录)
						  如果文件通配符模式语句中只包含*或.*，那么只匹配带有扩展名的文件
						  （例如默认是.ts、.tsx和.d.ts，如果allowJs设置为true，.js和.jsx也属于默认

      "exclude" 用来指定不需要被编译的文件目录，默认值： ["node_modules", "bower_components", "jspm_packages"]

      "extends" 继承外部的 配置文件，如果有冲突，用本文件中的配置

      "files"   指定被编译文件的列表（较少使用，只在项目很小，比较好穷举需要被编译的文件时才会用到）
  */
	"include": ["./src/**/*.ts"], /* src目录下的任意目录下的任意文件 */
	"extends": "./ehance" /* 继承./enhance.json文件中的配置 */

  /* compilerOptions 编译器的选项 */
	"compilerOptions": {
		// ts 被编译为的 ES 的版本， 默认 ES3
		// 可选： 'es3', 'es5', 'es6', 'es2015', 'es2016',
		// 'es2017', 'es2018', 'es2019', 'es2020', 'esnext'
		"target": "es6", // esnext 代表最新的 es 版本

		// module 指定要使用的模块化的规范
		// 'none', 'commonjs', 'amd', 'system', 'umd',
		// 'es6', 'es2015', 'es2020', 'esnext'
		"module": "es6",

		// lib 用来指定项目中要使用的库
		// 如：esnext dom dom.iterable webworker scripthost 等等
		"lib": ["esnext", "dom", "dom.iterable", "scripthost"],

		// 编译结果存放的目录
		"outDir": "./dist",

		// 指定一个 js 文件，该文件合并所有的编译（仅支持 amd 和 system 模块）
		// "outFile": "./dist/app.js",

		// 是否对 js 文件进行编译，默认 false
		"allowJs": false,

		// 是否检查编写的 js 代码符合规范，默认 false
		"checkJs": false,

		// 是否移除注释，默认 false
		"removeComments": false,

		// 是否不生成编译后的文件，默认 false
		"noEmit": false,

		// 是否有类型检查错误时，不生成编译后的文件，默认 false
		"noEmitOnError": false,

		// 所有严格检查的总开关, 设置为 false/true , 所有的严格检查配置都为 false/true
		// 一般如果有特殊配置,可以写在 strict 下面, 开发时建议设置为 true
		"strict": false,

		// 使用js的严格模式,在每一个文件上部声明 use strict, 默认 false
		// ! 但是设置为 true 后我查看编译后的文件，并没有显式的添加 'use strict'
		// ! 原来是文件中使用了 import 或 export 时，自动就进入了严格模式，所以没有显示
		"alwaysStrict": true,

		// 禁止隐式的 any 类型，需要显式指定类型
		"noImplicitAny": true,

		// 禁止隐式 any 类型的 this, 需要显示指定 this 的类型
		"noImplicitThis": true,

		// 严格执行空值检查 对于可能为空值的类型就行检查提示
		"strictNullChecks": true
	}
}
```

::: tip tsconfig.json 简述
tsconfig 中还有很多的配置选项，具体可以参考[官网文档](https://www.typescriptlang.org/zh/tsconfig)，当然 ts 的语法知识也可以再上面查看。
:::
