# fs 模块

`fs`模块是 node.js 的文件系统模块。负责访问文件系统并与文件系统进行交互。无需安装，直接引入：`const fs = require('fs')`。

## fs 方法总览

| 函数名                                          | 功能           |
| ----------------------------------------------- | -------------- |
| `fs.readFile(path[, options], callback)`        | 读取文件内容   |
| `fs.writeFile(path, data[, options], callback)` | 将数据写入文件 |

## fs.readFile

```js
const fs = require("fs");

// _dirname 指代当前文件的绝对路径，其中牵扯到 nodejs 的动态路径问题
// 动态路径：node.js 会将文件执行的路径与相对路径进行拼接
/**
 * @param {string | Buffer | URL | integer} path 路径
 * @param {Object | string} options 编码方式等
 * @param {Function} callback 读取文件后的回调函数
 */
fs.readFile(__dirname + "/word.txt", "utf8", (error, data) => {
	// error 在读取文件成功时为 null，失败时为错误对象
	if (error) {
		throw new Error(error.message);
	} else {
		console.log(data);
	}
});
```

## fs.writeFile

```js
const fs = require("fs");

/**
 * @param {string | Buffer | URL | integer} path 路径
 * @param {string | Buffer | TypedArray | DataView | Object } data 写入的数据
 * @param {Object | string} options 编码方式等
 * @param {Function} callback 写文件后的回调函数
 */
fs.writeFile(
	__dirname + "/word2.txt",
	`欲穷千里目，更上一层楼。`,
	err => {
		console.log(err);
	}
);
```
