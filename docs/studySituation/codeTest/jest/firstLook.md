# 初识 Jest

## 安装

`yarn add jest --dev`将**jest**添加未开发依赖，且为求方便，在**package.json**中添加脚本：

```json
// package.json
{
	"type": "module", // 让 node 支持 esm 的形式（import ... from ...）
	"scripts": {
		"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js" // 告诉 jest 支持 esm
	}
}
```

上面配置脚本的同时，也支持了**ESM**编程的方式，当然也可以使用**babel**将 esm 的代码转换成`node`形式的，同时安装 babel 需要的依赖库：

`yarn add --dev babel-jest @babel/core @babel/preset-env`

```js
// babe;.config.js
module.exports = {
	presets: [["@babel/preset-env", { targets: { node: "current" } }]], // 将代码转换成当前 node 版本可识别的代码
};
```

## 运行第一个测试

```js
// src/index.js
export default function sum(a, b) {
	return a + b;
}
```

```js
// src/test/index.spec.js
import sum from "../index.js";

/**
 * @function test 测试，类似 it
 * 参数1：测试内容
 * 参数2：运行函数 fn
*/
test("1 + 2 = 3", () => {
	// 1 + 2 === 3?
  // 期望 sum(1, 2) 函数的执行结果为 3
	expect(sum(1, 2)).toBe(3);
});

test("2 -5 = -3", () => {
	expect(sum(2, -5)).toBe(-3);
});
```
写好测试代码后，运行脚本`yarn test`，**jest**会自动检测`.spec(test).js(ts)`结尾的文件并运行。
