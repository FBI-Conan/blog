# 基本使用

- 创建 canvas 元素，并使用元素属性(attr/property)设置宽高

```html
<canvas width="500" height="500"></canvas>
```

- 获取 2d 画布上下文

```js
const canvasRef = document.querySelector("canvas");
// 获取上下文
const context = canvasRef.getContext("2d");
```

- 根据画布上下文进行绘制

```js
// 开始绘制路径
context.beginPath();
// 绘制一条 (0, 0) -> (300, 300) 的路径
context.moveTo(0, 0);
context.lineTo(300, 300);
// 绘制一条返回起点的线
context.closePath();
// 描画路径，给路径边界（轮廓）上色，颜色由 context.stokeStyle 决定
context.stoke();
```
