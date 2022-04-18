# qiankun

qiankun 是一个基于 single-spa 的微前端实现库，旨在帮助大家能更简单、无痛的构建一个生产可用微前端架构系统

示例项目：主应用（Vue3）+ 微应用（Vue3）

## 基本使用

新建项目目录

```
$ mdkir qiankun
$ cd .\qiankun\
```

创建 vue 项目

```
$ vue create main-app
$ vue create micro-app
```

应用框架使用的为`@vue/cli@4.5.15`生成的`vue3`

### 主应用

在 main-app 中安装 qiankun 包：

```
$ yarn add qiankun
```

- 注册微应用

```js
// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { registerMicroApps, start } from "qiankun";

createApp(App).use(router).use(ElementPlus).mount("#app");

registerMicroApps([
	{
		name: "vue app",
		entry: "http://localhost:8087", // 微应用的地址 （html entry，不同于 single-spa 的 js entry，需要微应用支持跨域）
		container: "#vue", // 微应用在主应用中的容器
		activeRule: "/vue", // 激活规则
	},
]);

start();
```

<br />

- App.vue

```vue
<template>
	<div style="height: 100%; display: flex; flex-direction: column">
		<el-menu default-active="/" :router="true" mode="horizontal">
			<el-menu-item index="/">首页</el-menu-item>
			<el-menu-item index="/vue">Vue</el-menu-item>
		</el-menu>
		<!--微应用-->
		<div class="micro-application">
			<!--主应用首页-->
			<router-view />
			<!--vue 微应用-->
			<div id="vue"></div>
		</div>
	</div>
</template>
```

### 微应用

微应用不需要额外安装任何其他依赖即可接入 qiankun 主应用。

- **改造 main.js**

导出规定的三个生命周期钩子：

```js
// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

let app;

function render(container) {
	app = createApp(App);
	app.use(router).mount(container ? container.querySelector("#app") : "#app");
}

// 全局变量 __POWERED_BY_QIANKUN__ 可用来区分当前是否运行在 qiankun 的主应用的上下文中
if (!window.__POWERED_BY_QIANKUN__) {
	// 独立运行
	render();
} else {
	// 主应用上下文
	// qiankun 将会在微应用 bootstrap 之前注入一个运行时的 publicPath 变量 __INJECTED_PUBLIC_PATH_BY_QIANKUN__
	__webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

export async function bootstrap(props) {}
export async function mount(props = {}) {
	// props 是主应用传入的对象参数
	const { container } = props;
	// 指定 container 可以防止微应用的根 id 与其他 DOM 冲突，导致微应用加载后容器 DOM 节点不存在了。
	render(container);
}
export async function unmount(props) {
	app.unmount();
}
```

<br />

- **配置路由前缀**

```js
// router/index.js

...

const router = createRouter({
	history: createWebHistory(window.__POWERED_BY_QIANKUN__ ? "/vue" : "/"),
	routes,
});

export default router;
```

<br />

- **vue.config.js**

```js
// vue.config.js
const packageName = require("./package.json").name;

module.exports = {
	devServer: {
		port: 8087,
		headers: {
			"Access-Control-Allow-Origin": "*",
		}, // 允许跨域
	},
	configureWebpack: {
		output: {
			library: `${packageName.name}-[name]`,
			libraryTarget: "umd",
			jsonpFunction: `webpackJsonp_${packageName}`,
		},
	},
};
```

## vs single-spa

| 框架       | entry      | 样式隔离                                        | js 隔离                            |
| ---------- | ---------- | ----------------------------------------------- | ---------------------------------- |
| qiankun    | html entry | 支持<br /> · Dynamic Stylesheet <br /> · Shadow Dom | 支持 <br /> · 快照 <br /> · Proxy 代理 |
| single-spa | js entry   | 不支持                                          | 不支持                             |
