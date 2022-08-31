# flex 布局

内容来源 MDN:

- [flex 布局的基本概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox)
- [控制 Flex 子元素在主轴上的比例](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Controlling_Ratios_of_Flex_Items_Along_the_Main_Ax#%E9%A2%84%E8%A7%88)

Flexible Box 模型，通常被称为 flexbox（弹性盒子），是一种一维的布局模型。它给 flexbox 的子元素之间提供了强大的空间分布和对齐能力。

采用了 flexbox 的区域就叫做 **flex 容器**。为了创建 flex 容器，我们把一个容器的 display 属性值改为 flex 或者 inline-flex。 完成这一步之后，容器中的直系子元素就会变为 **flex 元素**。所有 CSS 属性都会有一个初始值：

| 属性            | 默认值                       |
| --------------- | ---------------------------- |
| flex-grow       | 0                            |
| flex-shrink     | 1                            |
| flex-basic      | auto                         |
| flex            | initial (即 flex: 0 1 auto ) |
| flex-direction  | row                          |
| flex-wrap       | nowrap                       |
| align-item      | stretch                      |
| justify-content | flex-start                   |

所以 flex 容器中的所有 flex 元素都会有下列行为：

- 元素排列为一行 `flex-direction: row; flex-wrap: nowrap`。
- 元素从主轴的起始线开始 `justify-content: flex-start`。
- 元素不会在主维度方向拉伸，但是可以缩小 `flex: initial`。
- 元素被拉伸来填充交叉轴大小 `align-items: stretch`。

![flex 模型图示](/assets/img/css/flex-terms.png)

## flex 元素上的属性

- `flex-grow`
- `flex-shrink`
- `flex-basis`

### 可用空间

在考虑这几个属性的作用之前，需要先了解一下 **可用空间** available space 这个概念。这几个 flex 属性的作用其实就是改变了 flex 容器中的可用空间的行为。同时，可用空间对于 flex 元素的对齐行为也是很重要的。

假设在 1 个 500px 的容器中，我们有 3 个 100px 宽的元素，那么这 3 个元素需要占 300px 的宽，剩下 200px 的可用空间。在默认情况下，flexbox 的行为会把这 200px 的空间留在最后一个元素的后面。

![flex 可用空间](/assets/img/css/basics7.png)

如果期望这些元素能自动地扩展去填充满剩下的空间，那么我们需要去控制可用空间在这几个元素间如何分配，这就是元素上的那些 flex 属性要做的事。

### flex-basis

`flex-basis` 定义了该元素的空间大小（the size of that item in terms of the space），flex 容器里除了元素所占的空间以外的富余空间就是**可用空间** available space。

**默认是 auto，浏览器去检测元素是否具有确定的尺寸，有的话 flex-basic 采用元素确定的尺寸（上例中 flex-basis 是 100px），否则采用元素内容的尺寸（max-content）**。**0 表示 flex 子元素的大小不在空间分配计算的考虑之内**。

### flex-grow

`flex-grow` 若被赋值为一个正整数， flex 元素会以 `flex-basis` 为基础，沿主轴方向增长尺寸。这会使该元素延展，并占据此方向轴上的可用空间（available space）。如果有其他元素也被允许延展，那么他们会各自占据可用空间的一部分。**0 表示不伸张**。

### flex-shrink

`flex-grow`属性是处理 flex 元素在主轴上增加空间的问题，相反 `flex-shrink` 属性是处理 flex 元素收缩的问题。如果我们的容器中没有足够排列 flex 元素的空间，那么可以把 flex 元素 `flex-shrink` 属性设置为正整数来缩小它所占空间到 flex-basis 以下。与 flex-grow 属性一样，可以赋予不同的值来控制 flex 元素收缩的程度 —— <u>给 `flex-shrink` 属性赋予更大的数值可以比赋予小数值的同级元素收缩程度更大</u>。**0 表示不收缩**。

**_flexbox 会阻止小的 flex 子元素缩小到 0. 这些 flex 子元素会以 min-content 的大小进行铺设_**。

## flex 简写

- `flex: initial` === `flex: 0 1 auto`
- `flex: auto` === `flex: 1 1 auto`
- `flex: none` === `flex: 0 0 auto`
- `flex: <positive-number>` === `flex: <positive-number> <positive-number> 0 `

## 元素间的对齐和空间分配

### align-items

align-items 属性可以使元素在交叉轴方向对齐。

- `stretch` （默认）
- `flex-start`
- `flex-end`
- `center`

### justify-content

justify-content 属性用来使元素在主轴方向上对齐，主轴方向是通过 flex-direction 设置的方向。初始值是 flex-start，元素从容器的起始线排列。

- `stretch`
- `flex-start` （默认）
- `flex-end`
- `center`
- `space-around`
- `space-between`
