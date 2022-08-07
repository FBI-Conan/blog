# qiankun

qiankun 是一个基于 single-spa 的微前端实现库，旨在帮助大家能更简单、无痛的构建一个生产可用微前端架构系统。**亮点如下**：

- css 样式隔离
- js 沙箱
- html-entry

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
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { registerMicroApps, start } from 'qiankun';

createApp(App).use(router).use(ElementPlus).mount('#app');

registerMicroApps([
	{
		name: 'vue app',
		entry: 'http://localhost:8087', // 微应用的地址 （html entry，不同于 single-spa 的 js entry，需要微应用支持跨域）
		container: '#vue', // 微应用在主应用中的容器
		activeRule: '/vue', // 激活规则
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
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

let app;

function render(container) {
	app = createApp(App);
	app.use(router).mount(container ? container.querySelector('#app') : '#app');
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
const packageName = require('./package.json').name;

module.exports = {
	devServer: {
		port: 8087,
		headers: {
			'Access-Control-Allow-Origin': '*',
		}, // 允许跨域
	},
	configureWebpack: {
		output: {
			library: `${packageName.name}-[name]`,
			libraryTarget: 'umd',
			jsonpFunction: `webpackJsonp_${packageName}`,
		},
	},
};
```

## 源码

**思维导图**

<a href="/assets/img/qiankunSourceCode.svg" target='_blank'>![qiankun源码思维导图](/assets/img/qiankunSourceCode.svg)</a>

js 沙箱实现：

```js
function iter(obj, callback) {
	for (const prop in obj) {
		if (Object.hasOwnProperty.call(obj, prop)) {
			const val = obj[prop];
			callback(val, prop);
		}
	}
}

// 不支持 Proxy
class SnapshotSandbox {
	windowSnapshot = {};
	modifyPropsMap = {};

	active() {
		this.windowSnapshot = {};
		iter(window, (value, prop) => {
			this.windowSnapshot[prop] = value;
		});

		// 恢复之前的变更
		iter(this.modifyPropsMap, (prop, value) => {
			window[prop] = value;
		});
	}

	inactive() {
		this.modifyPropsMap = {};
		iter(window, (value, prop) => {
			// 获取刚激活时 window 快照中得属性值
			const preValue = this.windowSnapshot[prop];
			if (value !== preValue) {
				// 记录变更的值
				this.modifyPropsMap[prop] = value;
				// 恢复window值
				window[prop] = preValue;
			}
		});
	}
}

// 松散模式
class LegacySandbox {
	constructor() {
		this.addedPropsSetInSandbox = new Set();
		this.modifiedPropsOriginalValueMapInSandbox = new Map();
		this.currentUpdatedPropsValueMap = new Map();
		this.sandboxRunning = true;

		this.proxy = new Proxy(
			{},
			{
				get: (target, p) => {
					return window[p];
				},
				set: (target, p, value) => {
					const originalVal = window[p];
					if (!window.hasOwnProperty(p)) {
						// 新增
						this.addedPropsSetInSandbox.add(p);
					} else if (
						!this.addedPropsSetInSandbox.has(p) &&
						!this.modifiedPropsOriginalValueMapInSandbox.has(p)
					) {
						// 源码中没有 !this.addedPropsSetInSandbox.has("p")，这就说明会可能有在沙箱期间新增的属性也加进去了
						// 如果那样的话就得在失活的时候先处理修改的属性，再处理添加的属性
						this.modifiedPropsOriginalValueMapInSandbox.set(p, originalVal);
					}
					this.currentUpdatedPropsValueMap.set(p, value);

					window[p] = value;
					return true;
				},
			}
		);
	}

	active() {
		if (!this.sandboxRunning) {
			this.currentUpdatedPropsValueMap.forEach((value, prop) => {
				window[prop] = value;
			});
		}
		this.sandboxRunning = true;
	}

	inactive() {
		// 要是某个属性微应用在激活的时候新增了，但是在失活后，主应用又新增了同名属性，下次微应用在激活和失活后，该属性不就被删除了吗？
		// 所以是否需要在激活的时候去遍历 addedPropsSetInSandbox 确认其中的属性是否 window 都没有呢？
		this.addedPropsSetInSandbox.forEach(prop => {
			delete window[prop];
		});

		this.modifiedPropsOriginalValueMapInSandbox.forEach((value, prop) => {
			window[prop] = value;
		});

		this.sandboxRunning = false;
	}
}

// 严格模式

class ProxySandbox {
	constructor() {
		this.sandboxRunning = true;
		const handler = {
			get: (target, prop) => {
				return prop in target ? target[prop] : window[prop];
			},
			set: (target, prop, value) => {
				if (this.sandboxRunning) {
					if (!target.hasOwnProperty(prop) && window.hasOwnProperty(prop)) {
						// 与 widnow 对象的属性 descriptor 保持一致
						const descriptor = Object.getOwnPropertyDescriptor(window);
						Object.defineProperty(target, prop, {
							value,
							enumerable: descriptor.enumerable,
							configurable: descriptor.configurable,
							writable: descriptor.writable,
						});
					} else {
						target[prop] = value;
					}
				}
				return true;
			},
		};
		this.proxy = new Proxy({}, handler);
	}
	active() {
		this.sandboxRunning = true;
	}
	inactive() {
		this.sandboxRunning = false;
	}
}
```

## vs single-spa

| 框架       | entry      | 样式隔离                                            | js 隔离                                |
| ---------- | ---------- | --------------------------------------------------- | -------------------------------------- |
| qiankun    | html entry | 支持<br /> · Dynamic Stylesheet <br /> · Shadow Dom | 支持 <br /> · 快照 <br /> · Proxy 代理 |
| single-spa | js entry   | 不支持                                              | 不支持                                 |

## 常见问题

### 主应用与子应用样式隔离

1.  `{sandbox : { strictStyleIsolation: true }}` 为微应用容器包裹 shadow dom 节点，由于子应用的样式作用域仅在 shadow 元素下，那么一旦子应用中出现运行时越界跑到外面构建 DOM 的场景，必定会导致构建出来的 DOM 无法应用子应用的样式的情况。

2.  `{sandbox : { experimentalStyleIsolation: true }}` 开启运行时的 scoped css 功能，从而解决应用间的样式隔离问题。但是同样存在不能应用子应用中插入到 body 的元素样式。

3.  主应用与子应用在使用第三方库的时候(如 element plus)，更改 element plus 的类名前缀(默认是 el)

> 设置 ElConfigProvider

```vue
<!-- https://element-plus.gitee.io/zh-CN/guide/namespace.html -->
<!-- App.vue -->
<template>
	<el-config-provider namespace="ep">
		<!-- ... -->
	</el-config-provider>
</template>
```

> 设置 SCSS 和 CSS 变量

```js
// vue.config.js
import { defineConfig } from 'vite';
export default defineConfig({
	// ...
	css: {
		loaderOptions: {
			scss: {
				prependData: `@use "@/styles/element/index.scss" as *;`,
			},
		},
	},
	// ...
});
```

> 引用 element plus scss 样式文件

```ts
// main.ts
import 'element-plus/theme-chalk/src/index.scss'
```
