# 概述

Web Component 允许创建可重用的定制元素，它对于组件封装来说不是一个新鲜的概念。比如在 vue 中的封装了一个名为`my-component`的子组件，在其他组件中只需引入使用即可`<my-component />`。然而其他框架也有自己的组件形式，它们之间是不互通，不统一的。Web Component 是由 W3c 制定的标准，[主要由三项技术组成](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components#%E6%A6%82%E5%BF%B5%E5%92%8C%E4%BD%BF%E7%94%A8)：

- **Custom elements(自定义元素)**

- **Shadow DOM(影子DOM)**

- **HTML Template(HTML模板)**