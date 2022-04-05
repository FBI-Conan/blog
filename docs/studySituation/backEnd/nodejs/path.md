# path 模块

`path`模块是 node.js 的路径模块，用来访问文件系统并与文件系统交互。无需安装，直接引入：`const path = require('path')`。

## path 方法总览

| 函数名                       | 功能                     |
| ---------------------------- | ------------------------ |
| `path.basename(path[, ext])` | 返回路径的最后一部分     |
| `path.join([...paths])`      | 连接路径的两个或多个部分 |
| `path.extname(path)`         | 返回`path`的扩展名       |

## path.basename

```js
const path = require("path");

path.basename("/foo/bar/baz/asdf/quux.html");
// 返回: 'quux.html'

path.basename("/foo/bar/baz/asdf/quux.html", ".html");
// 返回: 'quux'
```

## path.join
```js
const path = require('path');

path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// 返回: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// 抛出 'TypeError: Path must be a string. Received {}'
```

## path.extname

```js
const path = require("path");

path.extname("index.html");
// 返回: '.html'

path.extname("index.coffee.md");
// 返回: '.md'

path.extname("index.");
// 返回: '.'

path.extname("index");
// 返回: ''

path.extname(".index");
// 返回: ''

path.extname(".index.md");
// 返回: '.md'
```
