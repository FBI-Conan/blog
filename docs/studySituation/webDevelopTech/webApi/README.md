# DragDrop

## draggable

在 HTML 中，除了图像、链接和选择的文本默认的可拖拽行为之外，其他元素在默认情况下是不可拖拽的。

因此，要使其他元素可拖拽，必须：

1. 为设置元素 `draggable` 属性为 `true`
2. 监听元素的 `dragstart` 事件，事件回调中主要记录当前的拖拽元素，设置拖拽要传递的数据

```html
<!-- 设置元素可拖拽 -->
<div class="draggable" draggable="true">1</div>
```

## dragstart 事件

该事件监听程序可以添加到**被拖拽元素本身**，也可以添加到祖先元素，比如直接在 `document` 上监听，`dragstart` 事件会冒泡。

1. 设置拖拽数据

setData 的第一个参数：[数据类型](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types)

```js
document.addEventListener("dragstart", e => {
	/**
	 * DataTransfer.setData 设置拖拽数据
	 * @param {string} format 数据类型
	 * @param {string} data 数据
	 */
	e.dataTransfer.setData("text/plain", "my text");
});
```

2. 拖拽效果 effectAllowed

`effectAllowed` 用来限制 `dropEffect` 的值，而 dropEffect 的值可以决定拖拽元素进入可放置元素后的光标效果。

```js
document.addEventListener("dragstart", e => {
	// none 不允许操作
	// copy 只复制
	// move 只移动
	// link 只链接
	// copyMove 复制或移动
	// copyLink 复制或链接
	// linkMove 链接或移动
	// all 复制、移动或链接（默认）
	e.dataTransfer.effectAllowed = "copy";
});
```

## 指定放置目标

`dragenter` `dragover` `dragleave`事件是绑定在可放置元素上，_网页或应用程序的大多数区域都不是放置数据的有效位置。因此，这些事件的默认处理是不允许放置_。**_如果你想要允许放置，你必须取消 `dragenter` 和 `dragover` 事件来阻止默认的处理（preventDefault）_**。

不可放置即意味着不能传输拖拽数据。

具体地限制操作类型可能还需要设置 `effectAllowed` 或 `dropEffect` 属性，或者两者都设置。**当然，如果不取消这个事件（preventDefault），改变这两个属性不会有任何效果**。

```js
drappableRef.addEventListener("dragover", e => {
	// 表示该位置允许放置
	// 可以检查 拖拽数据类型 拖拽效果(effectAllowed) 进行条件判断是否允许放置
	e.preventDefault();

	// 取消默认行为后，可以设置 dropEffect
	// copy move link all 之一
	e.dataTransfer.dropEffect = "copy";
});
```

## 放置反馈

有几种方法可以**向用户表明**（鼠标指针的视觉效果）哪个位置允许放置。鼠标指针将根据 `dropEffect` 属性的值做必要的更新。

典型的如加号图标会出现在 'copy' 中，而不允许放置时，会出现禁止放置的图标。[更多参照](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#dropfeedback)

## drop 事件

可放置元素的 `drop` 事件要触发，必须在可防止元素的 `dropenter` 或 `dropover` 的事件回调中取消事件的默认行为（preventDefault）。

1. 获取拖拽数据

```js
drappableRef.addEventListener("drop", e => {
  /** 
   * DataTransfer.getData 取回拖拽数据
   * @param format 拖拽数据类型
  */
	const data = event.dataTransfer.getData("text/plain");
  // 取回数据后，将它作为文本内容插入到可放置元素中
	event.target.textContent = data;
  // 阻止浏览器的默认程序处理放置数据（可设置可不设置，看需求）
  // 例如，当拖拽一个链接到网页时，Firefox 会打开这个链接。通过取消事件来阻止这样的行为。
	event.preventDefault();
});
```

## dragend 事件

`dragend` 事件会在拖拽源头（即触发 `dragstart` 的元素）上触发。无论拖拽是否成功都会被触发。该事件结束后，整个拖放操作就完成了
