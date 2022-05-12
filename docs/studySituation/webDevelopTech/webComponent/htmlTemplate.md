# HTML Template

## templte

1. 关于模板(template)

HTML `<template>` 元素及其内容不会在 DOM 中呈现，但仍可使用 JavaScript 去引用它：

```html
<template id="my-paragraph">
	<p>My paragraph</p>
</template>
```

上面的代码不会展示在页面中，但是可以在 js 中获取它的引用，然后添加到 DOM 中：

```js
let template = document.getElementById("my-paragraph");
// dom 对象存储在 content 属性中
let templateContent = template.content;
document.body.appendChild(templateContent);
```

2. 在 web component 中使用模板

模板搭配 web 组件使用可以起到直接在 html 中编写 shadow DOM 的体验，且模板也是一种封装。

```js
customElements.define(
	"my-paragraph",
	class extends HTMLElement {
		constructor() {
			super();
			let template = document.getElementById("my-paragraph");
			let templateContent = template.content;

			// Node.cloneNode方法用于克隆节点
			// Node.cloneNode(false) 浅克隆，只克隆节点本身，默认
			// Node.cloneNode(true) 深克隆，包括克隆子节点
			const shadowRoot = this.attachShadow({ mode: "open" }).appendChild(
				templateContent.cloneNode(true)
			);
		}
	}
);
```

[`Node.clone()`的更多参考](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/cloneNodes)

## slot

插槽由 name 属性标识，改进上述 shadow DOM：

```html
<template id="my-paragraph">
	<!--插槽中间的为默认内容，当不传入该插槽时显示-->
	<p><slot name="my-text">My default text</slot></p>
</template>
```

使用：

```html
<my-paragraph>
  <!-- slot属性值对应插槽名，然后改元素即被放置到对应插槽的位置 -->
	<span slot="my-text">Let's have some different text!</span>
</my-paragraph>
```
