# Shadow DOM

Shadow DOM 可以将一个隐藏的、独立的 DOM 附加到一个元素上。

## 基本用法

1. `Element.attachShadow()`将 shadow root 赋家到任何一个元素上：

```js
// open 模式下，可以通过 elementRef.shadowRoot 获取 shadow DOM，即attachShadow方法的返回值 shadow
const shadow = elementRef.attachShadow({ mode: "open" });

// closed 模式下，elementRef.shadowRoot 为 null
const shadow2 = elementRef2.attachShadow({
	mode: "closed",
});
```

2. 创建 shadow DOM 结构

```js
// 1. 直接重写 shadowRoot 的 innerHTML
this.shadowRoot.innerHTML = `
  <style>
    button {
      font-size: 20px;
    }
  </style>
  <button>按钮</button>
`;

// 2. 或者通过 document.createElement 方法一个个的创建 DOM 元素，最终通过 this.shadowRoot.append() 添加到 shadowRoot

...

```
