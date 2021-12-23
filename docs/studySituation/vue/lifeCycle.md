# 生命周期
1. 生命周期钩子

**vue2.x 生命周期图示**
![lifeCycle2.x](/assets/img/lifecycle.png)

**vue3.x 生命周期图示**
![lifeCycle3.x](/assets/img/lifecycle.svg)

> `vue2.x` --> `vue3.x`

- `beforeCreate` 此时的刚初始化了一个**vue**实例的对象，可以调用**this**，生命周期函数已经准备好。
- `created` 此时响应式数据已经初始化完成，可以调用**methods**中的方法以及操作**data**中的数据了。
- `beforeMount` 此时模板已经编译好了，尚未挂载到真实的**DOM**树上。
- `mounted` 挂载完成
- `beforeUpdate` 数据发生改变，尚未响应在视图上
- `updated` 数据变化使得**虚拟 DOM**对象发生变化，然后**上树(patch)**，完成了视图的更新。
- ~~`beforeDestory`~~ --> `beforeUnMount` 此时进入了组件卸载的阶段，此时响应式数据发生改变，已经不能**watch**到了，但是可以监听到子组件的触发的事件

```html
<el-checkbox ref="checkbox"></el-checkbox>
<sub-comp ref="test" @change="handleChange"></sub-comp>
```

```js
watch: {
  num(val) {
    console.log(val)
  }
},
beforeDestroy() {
  this.num++; // 已经监听不到num的变化了
  this.$refs.checkbox; // 能获取到该子组件
  this.$refs.test.$emit("change"); // 能监听到子组件提交的事件
},
destroyed() {
  this.$refs.checkbox; // undefined
},
methods: {
  handleChange() {
    console.log("我监听到啦~~"); // 我监听到啦~~
  }
}
```

- ~~`destroyed`~~ --> `unMounted` 子组件、事件监听器都已卸载

::: tip beforeDestroy(beforeUnMount)和 destroyed(beforeUnMount)的一些想法
这两个钩子函数所用的并不多，钩子期间发生了什么并不用纠察太细。一般使用到这两个钩子时，都是一些避免造成坏影响的事情，如定时器的销毁工作。在 vue2.x 中推荐`this.$once("hook:beforeDestory", () => {})`。
:::
