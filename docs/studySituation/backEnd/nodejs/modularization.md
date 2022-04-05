# 模块化

[参考文档\_编程宝库](http://www.codebaoku.com/it-js/it-js-234440.html)

## 基本概念

**模块化**就是遵守固定的规则，把一个大文件拆成独立并互相依赖的多个小模块。

把代码进行**模块化拆分的好处**：

- 提高了代码的*复用性*
- 提高了代码的*可维护性*
- 可以实现*按需加载*

**模块化规范**就是对代码进行模块化的拆分与组合时，需要遵守的那些规则。如：

- 使用什么样的语法格式来引用模块
- 在模块中使用什么样的语法格式向外暴露成员

**模块化规范的好处**：大家都遵守同样的模块化规范写代码，降低了沟通的成本，极大方便了各个模块之间的相互调用，利人利己。

## node.js 模块化分类

**内置模块**（内置模块是由 Node.js 官方提供的，例如 fs、path、http 等）

**自定义模块**（用户创建的每个 .js 文件，都是自定义模块）

**第三方模块**（由第三方开发出来的模块，并非官方提供的内置模块，也不是用户创建的自定义模块，使用前需要先下载）

## CommonJs 规范

`node.js` 默认使用 `CommonJs` 模块加载器来解释 `.js` 文件。如果在 `package.json` 文件中显示指明 `type` 字段为 `module` 则会使用 `ES` 模块加载器来解释 `.js` 文件。

CommonJS 模块的语法就是使用 `require` 和 `module.exports` 进行模块的导入导出的。(ES 模块的语法就是使用 `import` 和 `export` 进行模块的导入和导出。)

### 基础用法和概念

在每个模块中，`module <Module>` 自由变量是对代表当前模块的对象的**引用**。为方便起见，`module.exports` 也可通过 `exports` 模块全局访问。`module` 实际上不是全局的，而是每个模块本地的。

`require` 用于导入模块，返回的是导入模块的 `module.exports`。

:::: code-group
::: code-group-item a.js

```js
const dataFromB = require("./b.js");
console.log(dataFromB); // {a: 1}
```

:::
::: code-group-item b.js

```js
module.exports = { a: 1 };
// exports.a = 1;
```

:::
::::

### require 的假设实现

根据如下简易实现可以清晰两点：

1. `require` 是导入模块的大致流程
2. `module`、`module.exports` 和 `exports` 的真面目(下面代码中的`_module`)。

```js
/* 模块类（简写） */
class Module {
	constructor(filePath) {
		this.exports = {};
	}
}

/**
 * require的 假设实现
 * @param id 路径信息/模块名
 */
function require(id) {
	/* 根据路径信息/模块名获取完成的文件路径 */
	function getFilePathById(id) {}

	// 完整的模块路径
	const filePath = getFilePathById(id);

	// 每一文件路径都会生成一个模块实例
	// 为了更好的理解 命名为_module（实际源码中定义的的变量名是 module）
	const _module = new Module(filePath);

	// 加载模块
	((module, exports) => {
		// 根据 filePath 获取文件内容（fs），将这些文件内容转换成可以执行的代码
		/**
		 * 加载模块 (因此在自定义模块中才能直接使用 module 和 exports，
		 * module 和 exports 分别是外部定义的 _module 和 _module.exports 的引用)
		 */
	})(_module, _module.exports);

	return _module.exports;
}
```

::: tip require 加载确切文件名
假设：require(X) from module at path Y

1. X 是核心模块

   a. 返回该模块
   b. 不再继续执行

2. X 以 `./` 或 `../` 或 `/` 开头

   a. 将 X 当作文件处理，路径是 Y+X，依次查找 `X`、`X.js`、`X.json`、`X.node`，只要存在对应文件就不继续往下查找，退出不再继续执行

	 b. 如果 X 当作文件处理找不到确切文件名，则将 X 当做目录处理，目录路径仍是 Y+X，依次查找 `X/package.json(main字段确定入口文件)`、`X/index.js`、`X/index.json`、`X/index.node`，只要存在对应文件就不再继续往下查找，推出不再继续执行

3. X 没有前导 `./` 或 `../` 或 `/` 来指示文件

	假设 Y 为 `/home/ry/projects/foo.js`，X 为 `bar`，node 将按以下顺序确定文件位置 

	```:no-line-numbers
	/home/ry/projects/node_modules/bar

	/home/ry/node_modules/bar

	/home/node_modules/bar

	/node_modules/bar
	```

	然后按照上述文件位置顺序依次执行下面的步骤 a 和 b，只要找到了文件，就不继续往下查找，终止后续执行。
	
	a. 将 bar 当问文件进行处理，依次查找 `bar`、`bar.js`、`bar.json`、`bar.node`，只要存在对应文件就不继续往下查找，退出不再继续执行

	b. 如果当作文件处理找不到确切文件名，则将 bar 当作目录进行处理，依次查找 `bar/package.json(main字段确定入口文件)`、`bar/index.js`、`bar/index.json`、`bar/index.node`，只要存在对应文件就不再继续往下查找，推出不再继续执行
	 	

:::

### module.require 和 require

1. `require` 是 `module.require` 的封装，`require` 还有其他的属性，如 `require.cache`、`require.main`，但是两者都可以实现对模块的加载

```js
// index.js
console.log(require === module.require); // false
console.log(module.require("./index.js") === require("./")); // true
```

2. `module.require` 必须获得对 `module` 的引用。即 `require` 是当前模块下加载模块的方式，`module.require` 是 `module` 所在模块下加载模块的方式，因此可能存在路径上的差异

[示例](https://www.zhihu.com/question/291724309/answer/477497526)

```
├── bar
│   ├── index.js
│   └── name.js   // module.exports = 'bar'
└── foo
    ├── index.js  // module.exports = module
    └── name.js   // module.exports = 'foo'
```

:::: code-group
::: code-group-item bar/index.js

```js
const name = require("./name"); // 自家的require
const fooModule = require("../foo");
const fooName = fooModule.require("./name"); // 同样是./name，但用的是别家的module.require

console.log(name); // bar
console.log(fooName); // foo
```

:::
::: code-group-item bar/name.js

```js
module.exports = "bar";
```

:::

::: code-group-item foo/index.js

```js
module.exports = module; // 把module送出去
```

:::
::: code-group-item foo/name.js

```js
module.exports = "foo";
```

:::

::::
