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

[参考资料](https://segmentfault.com/a/1190000041336746)

single-spa 可以总结为是一个微应用的状态管理框架，其学习的思维导图如下：

<a href="/assets/img/singleSpaSourceCode.svg" target='_blank'>![single-spa源码思维导图](/assets/img/singleSpaSourceCode.svg)</a>

### mini-single-spa

```js
// 保存注册应用信息
const apps = [];

// 声明状态（部分） app.status
export const NOT_LOADED = "NOT_LOADED";
export const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE";
export const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED";
export const BOOTSTRAPPING = "BOOTSTRAPPING";
export const NOT_MOUNTED = "NOT_MOUNTED";
export const MOUNTING = "MOUNTING";
export const MOUNTED = "MOUNTED";
export const UNMOUNTING = "UNMOUNTING";

const registerApplication = appObj => {
	// appObj 只允许如下形式
	// {
	//   appName,  name
	//   loadApp,  app
	//   activeWhen, activeWhen
	//   customProps, customProps
	// }
	const registration = {
		appName: appObj.name,
		loadApp: appObj.app,
		activeWhen: appObj.activeWhen,
		customProps: appObj.customProps,
	};
	// 跳过校验

	// 跳过 appName 查重

	apps.push({
		...registration,
		status: NOT_LOADED,
	});

	reroute();
};

// 管理app状态，触发生命周期函数
const reroute = () => {
	// 将 app 归为 3 类
	// toload
	// tomount
	// tounmount
	// tounload 这类先不考虑
	const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges();

	if (started) {
		// 已经调用
		performAppChanges();

		function performAppChanges() {
			// 执行卸载操作
			const unmountPromise = appsToUnmount.map(async app => {
				app.status = UNMOUNTING;
				await app.unmount({ ...app.customProps });
				app.status = NOT_MOUNTED;
			});

			// 执行导入操作
			const loadPromise = appsToLoad.map(async app => {
				app.status = LOADING_SOURCE_CODE;
				const lifeCycles = await app.loadApp({ ...app.customProps });
				app.bootstrap = lifeCycles.bootstrap;
				app.mount = lifeCycles.mount;
				app.unmount = lifeCycles.unmount;
				app.status = NOT_BOOTSTRAPPED;
			});

			Promise.all(unmountPromise.concat(loadPromise)).then(() => {
				// 执行加载操作
				appsToLoad.concat(appsToMount).forEach(async app => {
					const appShouldBeActive = shouldBeActive(app);
					if (appShouldBeActive) {
						app.status = MOUNTING;
						await app.mount({ ...app.customProps });
						app.status = MOUNTED;
					}
				});
			});
		}
	} else {
		// 未调用 start 方法，只需要处理 appsToLoad，暂不考虑
	}
};

// 启动
let started = false; // 标记是否调用过 start 函数
const start = () => {
	started = true;
	reroute();
};

// 将 app 分为 3 类
const getAppChanges = () => {
	return apps.reduce(
		(res, app) => {
			const appShouldBeActive = shouldBeActive(app);
			switch (app.status) {
				case NOT_LOADED:
				case LOADING_SOURCE_CODE:
					res.appsToLoad.push(app);
					break;
				case NOT_BOOTSTRAPPED:
				case NOT_MOUNTED:
					if (appShouldBeActive) {
						res.appsToMount.push(app);
					}
					break;
				case MOUNTED:
					if (!appShouldBeActive) {
						res.appsToUnmount.push(app);
					}
					break;
			}
			return res;
		},
		{
			appsToLoad: [],
			appsToMount: [],
			appsToUnmount: [],
		}
	);
};

// 校验 app 是否该激活
const shouldBeActive = app => app.activeWhen(window.location);

// 监听 hashchange
window.addEventListener("hashchange", urlReroute);

const urlReroute = () => {
	reroute();
};

window.history.pushState = patchedUpdateState(window.history.pushState);
window.history.replaceState = patchedUpdateState(window.history.replaceState);

// 重写 pushState replaceState 方法，以便在调用时执行 reroute 方法
function patchedUpdateState(updateState) {
	return function () {
		const urlBefore = window.location.href;
		const res = updateState.apply(this, arguments);
		const urlAfter = window.location.href;
		if (urlBefore !== urlAfter) {
			// 路径不同，需要 reroute
			reroute();
		}
		return res;
	};
}

// 可以通过 singleSpaNavigate 判断微应用的运行环境
window.singleSpaNavigate = () => {};

export default {
	registerApplication,
	start,
};
```
