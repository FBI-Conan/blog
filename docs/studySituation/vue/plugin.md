# 插件

插件通常用来向 Vue 添加全局级的功能。可以是一个包含`install`方法的对象，或者一个`function`。

## 创建插件

插件通过`app.use`方法加载到应用程序中，如果插件是一个对象，就会调用`install`方法，如果插件是`function`，那么`function`本身会被调用。不论调用的是`install`方法还是函数本身，它们都会收到两个参数，由 Vue 的`createApp`生成的`app`对象以及用户自己传入的选项。

```ts
// plugins/i18n.ts（插件）
import { App } from "vue";
export default {
	// options 就是用户自己传入的选项，见 使用插件 -> main.ts 中的 i18nOptions
	install: (app: App, options: any): void => {
		// 创建一个深度查询对象中属性值的方法 $translate(key1.key2)
		const $translate = (key: string) => {
			return key.split(".").reduce((o: any, k: string) => {
				if (o) {
					return o[k];
				}
			}, options);
		};
		// 向全局注入 $translate 方法
		app.provide("$translate", $translate);
	},
};
```

## 使用插件

在使用`createApp()`初始化 Vue 应用程序后，通过`use()`方法加载插件。`use()`方法接受两个参数：

1. 插件

   同一插件多次使用`use()`方法进行加载，只在第一次加载时有效，后续的加载会被组织。

2. 用户传入的选项

   该参数是可选的，具体取决于每个特定的插件在编写时是否需要用户自己传入自定义的选项，上面编写的插件`i18n.ts`就调用了用户传入的选项，因此该插件需要该参数。

> main.ts 中加载

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./plugins/i18n";
const i18nOptions = {
	greeting: {
		hi: "hello",
	},
};

const i18nOptions2 = {
	greeting: {
		hi: "你好",
	},
};

createApp(App)
	.use(store)
	.use(router)
	.use(i18n, i18nOptions)
	.use(i18n, i18nOptions2) // 第二次加载同一插件i18n（无效）
	.mount("#app");
```

> 组件中使用

```ts
// 组件
import { defineComponent, inject } from "vue";

export default defineComponent({
	setup() {
		const $translate = inject<(key: string) => any>("$translate");
		console.log($translate!("greeting.hi")); // 输出 hello 而不是 你好，验证了第二次加载 i18n 插件无效
		return;
	},
});
```

::: tip app.config.globalProperties 与 provide/inject
插件`i18n.ts`中，使用了`app.provide`向子组件注入了`$translate`方法，除了`app.provide`之外，还有`app.config.globalProperties`的方式：

```ts
// plugin/i18n.ts
// 替换app.provide("$translate", $translate)
app.config.globalProperties.$translate = $translate;
```

```ts
// 组件
import { defineComponent, getCurrentInstance } from "vue";

export default defineComponent({
  setup() {
    /**
     * 不知道是否是vue版本尚不稳定的原因
     * 网上之前说通过 getCurrentInstance().ctx.$translate 可以获取到
     * 现在已经获取不到了
     * 所以目前还是更为推荐 provide/inject 的方式提供全局级的方法
    */
    const $translate = getCurrentInstance()?.appContext.app.config.globalProperties.$translate;
    console.log($translate!("greeting.hi"));
    return;
  },
});
:::
```
