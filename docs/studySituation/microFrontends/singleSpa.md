# single-spa

示例项目：基座应用（Vue3） + 微应用（Vue3）

## 基本使用

新建项目目录

```
$ mdkir single-spa
$ cd .\single-spa\
```

创建 vue 项目

```
$ vue create base-app
$ vue create sub-app1
$ vue create sub-app2
```

应用框架使用的为`@vue/cli@4.5.15`生成的`vue3`

### 基座

在 base-app 项目中安装 single-spa 包：

```
$ yarn add single-spa
```

- **配置 single-spa**

```js
// single-spa-config.js
import * as singleSpa from "single-spa";

// 导入微应用打包生成的 js 文件
function loadScript(url) {
	return new Promise((resolve, reject) => {
		const scriptRef = document.createElement("script");
		scriptRef.src = url;
		scriptRef.onload = resolve;
		scriptRef.onerror = reject;
		document.head.append(scriptRef);
	});
}

/**
 * 获取微应用导出的生命周期钩子
 * @param {*} url
 * @param {*} globalVar 微应用和基座约定暴露的全局变量名，对应 webpack.config 中的 library
 * @returns
 */
async function loadApp(url, globalVar) {
	// vue 应用会打包生成 /js/chunk-vendors.js 和 /js/app.js 两个文件，依次导入
	await loadScript(url + "/js/chunk-vendors.js");
	await loadScript(url + "/js/app.js");
	return window[globalVar];
}

// 注册微应用
// 微应用1
singleSpa.registerApplication({
	name: "micro-app1", // 名称，可随意取
	app: async () => loadApp("http://localhost:9331", "sub-app1"), // 加载函数：返回 Promise 对象，且值为子应用暴露的三个生命周期
	activeWhen: location => location.pathname.startsWith("/sub1"), // 激活函数：/sub1 同时也对应微应用 router/index.js 中的路由前缀
	customProps: {}, // 传递给子应用的对象
});
// 微应用2
singleSpa.registerApplication({
	name: "micro-app2",
	app: async () => loadApp("http://localhost:9332", "sub-app2"),
	activeWhen: location => location.pathname.startsWith("/sub2"),
	customProps: {},
});

// start 方法必须被调用，这时应用才会被真正挂载
singleSpa.start();
```

<br />

- **main.js 中引入 single-spa 配置文件**

```js
// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 引入 single-spa 配置文件
import "./single-spa-config";

createApp(App).use(router).mount("#app");
```

- **App.vue**

```vue
<template>
	<div id="nav">
		<router-link to="/">Home</router-link> |
		<router-link to="/sub1">微应用1</router-link> |
		<router-link to="/sub2">微应用2</router-link>
	</div>
	<router-view />
	<!--微应用容器-->
	<div id="sub-app-container"></div>
</template>
```

### 微应用

在 sub-app1 项目中安装 single-spa-vue 包：

```
$ yarn add single-spa-vue
```

- **改造 main.js**

导出规定的三个生命周期钩子：

```js
// main.js
import { createApp, h } from "vue";
import App from "./App.vue";
import router from "./router";

import singleSpaVue from "single-spa-vue"; // 用来为 vue 生成生命周期钩子 bootstrap mount unmount

// window.singleSpaNavigate 存在则处于基座环境，否则为独立运行环境
if (!window.singleSpaNavigate) {
	// 支持微应用独立运行
	createApp(App).use(router).mount("#app");
} else {
	// 基于基座应用时，为资源设置公共路径，放置资源地址请求错误
	__webpack_public_path__ = "//localhost:9331/";
}

// 获取生命周期钩子
const vueLifecycle = singleSpaVue({
	createApp,
	appOptions: {
		el: "#sub-app-container", // js entry 的方式，需要指定基座中预留的容器
		render() {
			return h(App);
		},
	},
	handleInstance: app => {
		app.use(router); // vue3 挂载路由的方式
	},
});

// 导出必须声明的三个生命周期钩子
export const { bootstrap, mount, unmount } = vueLifecycle;
```

<br />

- **配置路由前缀**

保证和匹配基座中微应用的路由相匹配（如 /sub1）：

```js
// router/index.js

...

const router = createRouter({
  // 基座模式下需要匹配基座中为该微应用分配的路由
	history: createWebHistory(
		window.singleSpaNavigate ? "/sub1" : process.env.BASE_URL
	),
	routes,
});

export default router;
```

<br />

- **vue.config.js**

配置服务端口、打包格式

```js
const packageName = require("./package.json");

module.exports = {
	configureWebpack: {
		// 导出umd格式的包，在全局对象上挂载属性packageName.name，基座应用需要通过这个全局对象获取一些信息，比如子应用导出的生命周期函数
		output: {
			// library的值在所有子应用中需要唯一
			library: packageName.name,
			libraryTarget: "umd",
		},
	},
	devServer: {
		port: 9331,
	},
};
```

## 源码

努力学习中，敬请期待...
