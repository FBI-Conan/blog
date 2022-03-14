# vue 组件测试

在终端执行`vue create vue-jest`，并选择好**jest**测试选项，生成支持 jest 测试的 vue 项目。

vue 组件：

```vue
<!-- Greeting.vue -->
<template>
	<div>{{ msg }}</div>
</template>

<script lang="ts">
	import { defineComponent, ref } from "@vue/runtime-core";

	export default defineComponent({
		setup() {
			const msg = ref("hello jest");
			return {
				msg,
			};
		},
	});
</script>
```

测试代码：

```ts
// greeting.spec.ts
import { mount } from "@vue/test-utils";
import Greeting from "../../src/components/Greeting.vue";

// describe 测试分组，与 test 的语法相同
describe("Greeting.vue", () => {
	test("hello", () => {
		// mount 用来挂载 vue 组件的
		// text()方法会返回组件的文本内容
		expect(mount(Greeting).text()).toMatch("hello");
	});
});
```

## mount 和 shallowMount

**mount**深度挂载，会渲染子组件，**shallowMount**浅挂载，不渲染子组件。

vue 组件：

```vue
<!-- Foo.vue -->
<template>
	<div>
		foo
		<bar></bar>
	</div>
</template>

<script lang="ts" setup>
	// setup 是语法糖，可以省去很多声明的代码
	import Bar from "./Bar.vue";
</script>

<style></style>
```

```vue
<!--Bar.vue-->
<template>
	<div>bar</div>
</template>
```

测试代码：

```ts
// foo.spec.ts
import Foo from "@/components/Foo.vue";
import { mount, shallowMount } from "@vue/test-utils";

describe("Foo.vue", () => {
	it("mount", () => {
		const wrapper = mount(Foo);
		// html() 方法会返回包含元素在内的内容
		console.log(wrapper.html()); //<div> foo <div>bar</div> </div>
		expect(wrapper.text()).toBe("foo bar");
	});
	it("shallowMount", () => {
		const wrapper = shallowMount(Foo);
		// <div>bar</div> 替换成了 bar-stub></bar-stub>
		console.log(wrapper.html()); // <div class="test"> foo <bar-stub></bar-stub> </div>
		expect(wrapper.text()).toMatch("foo");
	});
});
```

## vue 条件渲染测试

一般的元素的获取方式：`mount(Component).get(selectors)`，
包含 **v-if** 和 **v-show** 指令的元素不能直接获取，只能使用 find 方法`mount(Component).find(selectors)`，判断**v-if**指令的元素是否存在`exist()`，判断**v-show**指令的元素是否可见`isVisible()`。

组件：

```vue
<!--Baz.vue-->
<template>
	<div>
		<div id="aa">aa</div>
		<div id="bb" v-if="isRender">bb</div>
		<div id="cc" v-show="isShow">cc</div>
	</div>
</template>

<script lang="ts" setup>
	import { ref } from "@vue/reactivity";

	const isRender = ref(false);
	const isShow = ref(false);
</script>
```

测试代码：

```ts
// baz.spec.ts
import { mount } from "@vue/test-utils";
import Baz from "@/components/Baz.vue";
import { ref } from "vue";

describe("Bza.vue", () => {
	it("get", () => {
		const wrapper = mount(Baz);
		// get 只能获取一定存在的元素
		const aa = wrapper.get("#aa");
		expect(aa.text()).toBe("aa");
	});
	it("find", () => {
		// mount 可以指定挂载时的组件内容，该内容会与原先的组件内容进行合并
		const wrapper = mount(Baz, {
			setup() {
				const isRender = ref(true);
				return { isRender };
			},
		});
		const bb = wrapper.find("#bb");
		// 判断包含 v-if 指令元素的状态是看是否存在
		expect(bb.exists()).toBe(true);
	});

	it("visible", () => {
		const wrapper = mount(Baz, {
			setup() {
				const isShow = ref(true);
				return { isShow };
			},
		});
		const cc = wrapper.find("#cc");
		// 判断包含 v-show 指令元素的状态是看是否可见，它是一定存在的
		expect(cc.isVisible()).toBe(true);
	});
});
```

## emit 事件测试

vue 组件：

```vue
<!--Counter.vue-->
<template>
	<button @click="inc"></button>
</template>

<script lang="ts" setup>
	import { ref } from "@vue/reactivity";
	const count = ref(0);
	const emit = defineEmits<{
		(event: "increase", count: number): void;
	}>();
	const inc = function () {
		emit("increase", ++count.value);
	};
</script>
```

测试代码：

```ts
// counter.spec.ts
import Counter from "@/components/Counter.vue";
import { mount } from "@vue/test-utils";

describe("Counter.vue", () => {
	test("获取 emit 事件", () => {
		const wrapper = mount(Counter);
		const btn = wrapper.get("button"); // 获取按钮
		btn.trigger("click"); // 触发点击事件
		console.log(wrapper.emitted()); // { increase: [ [ 1 ] ], click: [ [ [MouseEvent] ] ] }
		// 验证 emitted() 返回结果中是否有 increase 属性即可验证触发了 increase 事件
		expect(wrapper.emitted()).toHaveProperty("increase");
	});

	test("获取 emit 值", () => {
		const wrapper = mount(Counter);
		const btn = wrapper.get("button");
		btn.trigger("click");
		// emitted 也可以直接传入事件名
		console.log(wrapper.emitted("increase")); // [ [ 1 ] ]
		expect(wrapper.emitted("increase")![0]).toEqual([1]);
	});
});
```

## props 和 setProps

vue 组件：

```vue
<!--Password.vue-->
<template>
	<input type="text" v-model="inputValue" />
	<div v-if="error" data-test="error">{{ error }}</div>
</template>

<script lang="ts" setup>
	import { ref } from "@vue/reactivity";
	import { computed } from "@vue/runtime-core";
	// eslint-disable-next-line no-undef
	const props = defineProps<{
		minLenght: number;
	}>();

	const inputValue = ref("");

	const error = computed(() => {
		return inputValue.value.length >= props.minLenght
			? ""
			: `必须超过${props.minLenght}字符`;
	});
</script>
```

测试代码：

```ts
// password.spec.ts
import Password from "@/components/Password.vue";
import { mount } from "@vue/test-utils";

describe("Password.vue", () => {
	test("测试错误提示出现", async () => {
		// 挂载时通过 props 设置最大长度
		const wrapper = mount(Password, {
			props: {
				minLenght: 10,
			},
		});

		const inputEl = wrapper.get("input");
		await inputEl.setValue("hahaha"); // 设置输入框的值（异步）

		expect(wrapper.text()).toContain("必须超过10字符");

		expect(wrapper.find("[data-test='error']").exists()).toBe(true);

		// setProps 可以重新设置 props
		await wrapper.setProps({
			minLenght: 5,
		}); // 异步

		expect(wrapper.find("[data-test='error']").exists()).toBe(false);
	});
});
```

## slot 测试

如何传入插槽内容进行测试？默认插槽（default）和具名插槽（name）的传递有什么不同？插槽作用域的参数使用？传递插槽内容有多少种方式？

vue 组件：

```vue
<!--Page.vue-->
<template>
	<slot></slot>
	<header>
		<slot name="header"></slot>
	</header>
	<main>
		<slot name="main" :msg="message"></slot>
	</main>
	<footer>
		<slot name="footer"></slot>
	</footer>
</template>

<script lang="ts" setup>
	import { ref } from "@vue/reactivity";

	const message = ref("slot test");
</script>
```

测试代码：

```ts
// page.spec.ts
import { mount } from "@vue/test-utils";
import Page from "@/components/Page.vue";
import Foo from "@/components/Foo.vue";
import { h } from "vue";

describe("插槽测试", () => {
	test("默认插槽", () => {
		const wrapper = mount(Page, {
			slots: {
				default: "<div>page</div>", // default表示默认插槽
			},
		});
		console.log(wrapper.text());
		expect(wrapper.text()).toBe("page");
	});

	test("具名插槽", () => {
		const wrapper = mount(Page, {
			slots: {
				header: "<div>header</div>",
			},
		});
		console.log(wrapper.get("header"));
		expect(wrapper.get("header").text()).toBe("header");
	});

	test("作用域插槽", () => {
		const wrapper = mount(Page, {
			slots: {
				main: `
          <template #main="{ msg }">
            hello {{msg}}
          </template>
        `,
			},
		});
		console.log(wrapper.get("main"));
		expect(wrapper.get("main").text()).toBe("hello slot test");
	});

	test("插槽内容传递的多种形式", () => {
		// string
		// array
		// object
		// component
		// vnode
		const wrapper = mount(Page, {
			slots: {
				// default: "<div>foo</div>",
				// default: ["<div>foo</div>"],
				// default: {
				//   template: "<div>foo</div>"
				// },
				// default: Foo, //  wrapper.text() === 'foo bar'
				default: h("div", "foo"),
			},
		});

		expect(wrapper.text()).toBe("foo");
	});
});
```
