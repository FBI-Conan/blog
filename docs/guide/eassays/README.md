## HTML

> a 标签

```html
<a herf="https://www.baidu.com" target="_blank"></a>
```

## CSS

> 类选择器

```css
.clazz-container {
	display: flex;
	flex-direction: cloumn;
}
```

## JavaScript

> Proxy

```js
const target = { a: 1, b: 2 };
const handler = {
	/**
	 * @param target 目标对象
	 * @param property 目标对象上的字符串键属性
	 * @param receiver 代理对象/继承代理对象的对象
	 */
	get(target, property, receiver) {
		return Reflect(...arguments);
	},
};
const proxy = new Proxy(target, handler)
```
