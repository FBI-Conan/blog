# 概括

`TypeScript`是`JavaScript`的超集，拥有静态类型检查（在代码运行之前预测期望的代码）以及其他 JS 尚不支持的新特性，可以帮助前端开发者更好的规范和维护代码。

## 类型擦除

[类型擦除是计算机程序设计时，在编译期明确去掉所编程序（某部分）的类型系统。](https://zh.m.wikipedia.org/zh-hans/%E7%B1%BB%E5%9E%8B%E6%93%A6%E9%99%A4)。去除 ts 的类型信息转换成 js 的过程就是类型擦除。

擦除方式：

```shell
# 快（不检查 ts 语法，且语言优势）
npm i -D esbuild
npx esbuild index.ts > index.js

npm i -D @swc/cli @swc/core
npx swc index.ts -o index.js
# 慢
npm i -D typescript
npx tsc index.ts

npm i -D @babel/core @babel/cli @babel/preset-typescript
npx babel --presets @babel/preset-typescript index.ts

```

## node 中直接运行 ts

- [node-ts](https://github.com/TypeStrong/ts-node)

```shell
# Locally in your project.
npm install -D typescript ts-node

# Execute a script as `node` + `tsc`.
ts-node script.ts
```

- [swc-node](https://github.com/swc-project/swc-node)

```shell
# install
npm i -D @swc-node/register
# usage
node -r @swc-node/register script.ts
```

- [esno](https://github.com/esbuild-kit/esno)

```shell
npm i -g esno
esno index.ts
```

## 在线运行

- [TS Playground](https://www.typescriptlang.org/play?#code/Q)
- [playcode.io](https://playcode.io/typescript/)
- [stackblitz](https://stackblitz.com/)
- [codesandbox](https://codesandbox.io/)

## 使用 Vite 运行 TS

使用 Vite 创建本地 TS 项目，搭配浏览器运行 TS

## 书籍推荐

首推官方文档 [handlebook](https://www.typescriptlang.org/docs/handbook/intro.html)

- [《编程与类型系统》](https://book.douban.com/subject/35325133/)
- [《Typescript 编程》](https://book.douban.com/subject/35134660/)
- [《类型和程序设计语言》](https://book.douban.com/subject/1318672/)
