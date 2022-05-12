# Custom Elements

`CustomElementRegistry.define()`方法用来注册一个自定义元素，该方法接受以下参数：

- 自定义组件的名称：必须含有短横线，不能是单个单词。

- 用于定义元素行为的类。

- `可选参数`，一个包含`extends`属性的配置对象，指定所创建的元素继承自哪个内置元素，可以继承任何内置元素。

eg:

```js
// CustomElementRegistry 接口提供注册自定义元素和查询已注册元素的方法。
// 要获取它的实例，请使用 window.customElements属性。
customElements.define("word-count", WordCount, { extends: "p" });
```

## 两种自定义元素

自定义元素有两种形式：自主的自定义元素（Autonomous custom elements）和定制的内置元素（Customized built-in elements）。两者的区别就是继承的类是否是内置的元素类。

用于定义元素行为的类：

```js
/* Autonomous custom elements */
// 继承 HTMLElement 类
class PopUpInfo extends HTMLElement {
  constructor() {
    // 必须首先调用 super方法来建立正确的原型链继承关系
    super();

    // 元素的功能代码写在这里

    // 创建 shadowDOM 并关联至元素上
    // const shadow = this.attachShadow({mode: "open"})
    // console.log(shadow === this.shadowRoot)  // open模式下两者相等 true
    ...
  }
}
// Autonomous custom elements 的定义方式
customElements.define('popup-info', PopUpInfo);


/* Customized built-in elements */
// 继承特定的类，这里是 HTMLUListElement，即 ul 元素类
class ExpandingList extends HTMLUListElement {
  constructor() {
    super();

    ...
  }
}
// Customized built-in elements 的定义方式
customElements.define('expanding-list', ExpandingList, { extends: "ul" });
```

在 html 中两种自定义元素的引用方式：

```html
<!--Autonomous custom elements 的引用方式-->
<popup-info></popup-info>

<!--Customized built-in elements 的引用方式-->
<ul is="expanding-list">
	...
</ul>
```

## 生命周期

在用于定义元素行为的类中，可以指定多个不同的声明周期回调函数：

| 声明周期                   | 调用时刻                                             |
| -------------------------- | ---------------------------------------------------- |
| `connectedCallback`        | 当 custom element 首次被插入文档 DOM 时，被调用      |
| `disconnectedCallback`     | 当 custom element 从文档 DOM 中删除时，被调用        |
| `adoptedCallback`          | 当 custom element 被移动到新的文档时，被调用         |
| `attributeChangedCallback` | 当 custom element 增加、删除、修改自身属性时，被调用 |

注意：`attributeChangedCallback`需要搭配`observedAttributes`监听属性进行使用

```js
class MyElement extends HTMLElement {
	static get observedAttributes() {
		// 数组中的元素即是需要监听的属性名
		return ["attrName"];
	}
	// 编写属性变化后的回调函数
	/**
	 * @param name 属性名
	 * @param oldVal 旧属性值
	 * @param newVal 新属性值
	 */
	attributeChangedCallback(name, oldVal, newVal) {
		//implementation
	}
}
```

::: tip attr 和 propery

1. attr 指的是 ele.setAttribute('attrName', 'attrVal')添加的属性

2. propery 指的是 ele.propertyName = propertyVal 的方式添加到元素上的属性

:::
