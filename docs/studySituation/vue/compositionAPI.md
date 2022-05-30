# 组合式 api

- 选项式 api：`data` `computed` `methods`等

vue2.x 中利用选项式 api 进行开发，存在一个较为明显的问题：就是隶属于同一套逻辑的代码，你需要在`data`中定义响应式数据，在`watch`中监听响应式数据，在`methods`中定义实现某功能的函数。

**问题**：整个逻辑代码被强制的拆分到各个选项中去了，当需要找代码时，你需要来回的上下各处去跳着查找，尤其是当一个`vue`文件中存在几套小逻辑时，那种上下翻阅的痛苦不言而喻。尤其是我几次接手别人代码感触尤甚:cry:，看起来简直叫一个乱。

- 组合式 api: 入口`setup`

在 setup 中，你可以根据逻辑来组织代码，可以将一个逻辑的代码写在一块，整体感会更好，也利于之后抽取相应的逻辑代码进行复用。

<u>[引用掘金社区上分享的一张动图可以很好的说明组合式 api 的作用](https://juejin.cn/post/6890545920883032071)</u>。
![组合式api与选项式api的对比](/assets/img/compositionApi.webp)

## 组合式 api 介绍

### setup

```js
import { toRef, ref } from 'vue'
/**
 * 组合式api的入口函数setup（在beforeCreate钩子之前执行）
 * @param props 父组件的传值
 * @param context 存放可能在setup中需要用到的值
*/
setup(props, context) {
  // 响应式解构 props 中的变量
  const {prop} = toRef(props);
  // 解构 context(非响应式的)
  const {attrs, slots, emit, expose} = context; // expose 用于在 setup 返回渲染函数时，将组件的方法通过模板ref暴露给父组件使用

  const count = ref(0);
  const increment = () => ++count.value;

  expose({
    increment
  });

  return () => h('div', count.value)
}
```

### 生命周期钩子

> 选项式 api ---> setup 内部

|    选项式 api     |     setup 内部      |                描述                |
| :---------------: | :-----------------: | :--------------------------------: |
|  `beforeCreate`   |    Not needed\*     |                                    |
|     `created`     |    Not needed\*     |                                    |
|   `beforeMount`   |   `onBeforeMount`   |                                    |
|     `mounted`     |     `onMounted`     |                                    |
|  `beforeUpdate`   |  `onBeforeUpdate`   |                                    |
|     `updated`     |     `onUpdated`     |                                    |
|  `beforeUnmount`  |  `onBeforeUnmount`  |                                    |
|    `unMounted`    |    `onUnmounted`    |                                    |
|  `errorCaptured`  |  `onErrorCaptured`  |       捕获来自后代组件的错误       |
|  `renderTracked`  |  `onRenderTracked`  |    跟踪虚拟 DOM 重新渲染时调用     |
| `renderTriggered` | `onRenderTriggered` |  当虚拟 DOM 重新渲染被触发时调用   |
|    `activated`    |    `onActivated`    | 被 keep-alive 缓存的组件激活时调用 |
|   `deactivated`   |   `onDeactivated`   | 被 keep-alive 缓存的组件失活时调用 |

### watch 和 watchEffect

两个 api 都可以用来监听响应式的变量，不同点如下：

> 1. 用法

watch 需要指定监听的值及回调函数

```js
// 监听 ref 类型数据
const count = ref(0);
watch('count', () => {
  // ...
});

// 监听 getter 数据
const state = reactive({
  count: 0
})；
watch(() => state.count, () => {
  // ...
  // 假设回调函数中引用了其他的响应式数据 count.value 时
  // count.value 变化并不引起该回调函数的重新执行
})

// 边缘情况，直接监听响应式对象（reactive）
// 该种情况下，vue 会强制帮你深度监听，即使设置了 { deep: false }
watch(state, () => {
  // ...
})
// <==> 等价于
watch(() => state, () => {
  // ...
}, {
  deep: true
})
```

watchEffect 只需传入回调函数

```js
const state = reactive({
	count: 0,
});

// pre 模式（默认）：回调函数执行于组件 update 的钩子函数之前
// 且是异步执行的（在一个 DOM 更新周期[即一个tick]内的多次改变响应式数据，只会执行一次回调函数）
watchEffect(() => {
	console.log("当前 state.count 的值：", state.count);
});

// post模式：回调函数执行于组件 update 的钩子之后
watchEffect(
	() => {
		//...
	},
	{ flush: "post" }
);

// sync 模式：回调函数同步执行（每改变一次响应式数据，立即执行回调）
/* 示例：每调用一次 add 函数，watchEffect 中的回调函数执行两遍，sync 模式是低效的，应该很少需要
  add() {
    state.count++;
    state.count++;
  }
*/
watchEffect(
	() => {
		console.log("当前 state.count 的值：", state.count);
	},
	{
		flush: "sync",
	}
);
```

> 2. 其他

| /              | watch  | watchEffect            |
| -------------- | ------ | ---------------------- |
| 执行           | 惰性   | 立即执行(需要收集依赖) |
| 响应式数据旧值 | 可获取 | 不可获取               |
| 同时监听多个值 | 可以   | 可以                   |

```js
// watch 同时监听多个值
const count = ref(10);
const price = ref(20);
watch([count, price], ([countVal, priceVal], [preCountVal, prePriceVal]) => {
	console.log("当前数量：", countVal);
	console.log("先前数量：", preCountVal);
	console.log("当前价格：", priceVal);
	console.log("先前价格：", prePriceVal);
});
```

## 组合式 api 的易封装性

组合式 api 强大的代码组织能力及逻辑复用能力可以轻松的实现代码的高质量封装，任何在 setup 中书写的代码，都可以很方便的放置在某一函数中以便其他组件的复用。在 vue2.x 中，常使用 Mixin 功能分发 vue 组件中的可复用功能，mixin 对象中包含的任何组件选项都能混合至其他组件中。

例子：

```js
// 获取鼠标位置的功能
const mouseMixin = {
	data() {
		return {
			x: 0,
			y: 0,
		};
	},
	mounted() {
		window.addEventListener("mousemove", this.update);
	},
	unmounted() {
		window.removeEventListener("mousemove", this.update);
	},
	methods: {
		update(e) {
			this.x = e.pageX;
			this.y = e.pageY;
		},
	},
};

// 定义一个使用 mouseMixin 的组件
const App = {
	mixins: [mouseMixin],
	template: `{{ x }} {{ y }}`,
};

Vue.createApp(App).mount("#app"); // 可以在屏幕上显示鼠标当前位置
```

上述例子中的 App 组件通过 Mixin 复用了一个获取鼠标当前位置 {x , y} 的功能，当 mixins 中只有一个成员 mouseMixin 时还好，我们可以知道变量 x 和 y 是从何处混入的，而当 mixins 中的成员有多个时`mixins: [mouseMixin, keyboardMixin, anotherMixin]`，我们**无法直接准确的知道变量是谁混入的**。并且 mixin 还需要考虑**命名冲突的问题**，在 mouseMixin 中定义 update 方法时，我们需要想一想其他 mixin 中会不会也有 update 方法，这样命名是否合适。

而选项式 api 中复用组件功能时，这两个问题就迎刃而解了：

```js
const { createApp, onMounted, onUnmounted, ref } = Vue;

// 封装的 mouse 函数都是可以直接在 setup 中书写的，因此封装很便利
function mouse() {
	const x = ref(0);
	const y = ref(0);
	// update 函数选择不暴露出去，更谈不上命名冲突了
	function update(e) {
		x.value = e.pageX;
		y.value = e.pageY;
	}
	onMounted(() => {
		window.addEventListener("mousemove", update);
	});
	onUnmounted(() => {
		window.removeEventListener("mousemove", update);
	});
	return {
		x,
		y,
	};
}

const App = {
	template: `{{ x }} {{ y }}`,
	setup() {
		const { x, y } = mouse(); // 很清楚的可以知道 x y 的来源
		return {
			x,
			y,
		};
	},
};

createApp(App).mount("#app");
```
