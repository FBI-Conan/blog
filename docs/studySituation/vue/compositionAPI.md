# 组合式 api

## 为什么需要组合式 api

- 选项式 api：`data` `computed` `methods`等

vue2.x 中利用选项式 api 进行开发，存在一个较为明显的问题：就是隶属于同一套逻辑的代码，你需要在`data`中定义响应式变量，在`watch`中监听响应式变量，在`methods`中定义实现某功能的函数。

**问题**：整个逻辑代码被强制的拆分到各个选项中去了，当需要找代码时，你需要来回的上下各处去跳着查找，尤其是当一个`vue`文件中存在几套小逻辑时，那种上下翻阅的痛苦不言而喻。尤其是我几次接手别人代码感触尤甚:cry:，看起来简直叫一个乱。

- 组合式 api: 入口`setup`

在 setup 中，你可以根据逻辑来组织代码，可以将一个逻辑的代码写在一块，整体感会更好，也利于之后抽取相应的逻辑代码进行复用。

<u>[引用掘金社区上分享的一张动图可以很好的说明组合式 api 的作用](https://juejin.cn/post/6890545920883032071)</u>。
![组合式api与选项式api的对比](/assets/img/compositionApi.awebp)

## 组合式 api 介绍

1. setup

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
  const {attrs, slots, emit, expose}; // expose 用于在 setup 返回渲染函数时，将组件的方法通过模板ref暴露给父组件使用

  const count = ref(0);
  const increment = () => ++count.value;

  expose({
    increment
  });

  return () => h('div', count.value)
}
```

2. setup 内部的生命周期钩子
   > 选项式 api ---> setup 内部

|    选项式 api     |     setup 内部      |                描述                |
| :---------------: | :-----------------: | :--------------------------------: |
|  `beforeCreate`   |    Not needed\*     |                                    |
|     `created`     |    Not needed\*     |                                    |
|   `beforeMount`   |   `onBeforeMount`   |                                    |
|     `mounted`     |     `onMounted`     |                                    |
|  `beforeUpdate`   |  `onBeforeUpdate`   |                                    |
|     `updated`     |     `onUpdated`     |                                    |
|  `beforeunMount`  |  `onBeforeUnmount`  |                                    |
|    `unMounted`    |    `onUnmounted`    |                                    |
|  `errorCaptured`  |  `onErrorCaptured`  |       捕获来自后代组件的错误       |
|  `renderTracked`  |  `onRenderTracked`  |    跟踪虚拟 DOM 重新渲染时调用     |
| `renderTriggered` | `onRenderTriggered` |  当虚拟 DOM 重新渲染被触发时调用   |
|    `activated`    |    `onActivated`    | 被 keep-alive 缓存的组件激活时调用 |
|   `deactivated`   |   `onDeactivated`   | 被 keep-alive 缓存的组件失活时调用 |
