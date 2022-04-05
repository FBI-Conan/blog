# http 模块

`http`模块是 node.js 网络的关键模块。无需安装，直接引入：`const http = require('http')`。

## http 方法/类总览

| 方法/类名              | 描述      |
| ---------------------- | --------------------- |
| `http.createServer()`    | 创建一个服务器 |
| `http.Server`          | 当使用`http.createServer()`创建新的服务器时，通常会实例化并返回此类|
| `http.IncomingMessage` | `http.IncomingMessage` 对象可通过以下方式创建：<br>• `http.Server`，当监听 `request` 事件时。<br> • `http.ClientRequest`，当监听 `response` 事件时 |
| `http.ServerResponse` | 由 `http.Server` 创建，并作为第二个参数传给它触发的 `request` 事件 |

## http.createServer

`http.createServer`方法会创建并返回一个服务器，这个服务器是`http.Server`类的实例。

```js
// 1. 引入 http 模块
const http = require("http");

// 2. 创建服务器实例
const server = http.createServer();

// 3. 监听客户端 request 事件
server.on("request", (req, res) => {
	// req <http.IncomingMessage>
	const url = req.url; // 端口后的那部分  如 / 或者 /index.html 等
	const method = req.method;
	const str = "请求路径是" + url + ", 请求方法是" + method;

	// res <http.ServerResponse>
	res.setHeader("Content-Type", "text/html; charset=utf-8"); // 解决中文乱码的情况

	res.end(str); // 向客户端发送响应数据
});

// 4. 启动 http 服务并监听连接
server.listen("3000", () => {
	console.log("3000端口监听中...");
});
```

## http.Server

`http.Server`类：
| 事件名 | 描述 | 回调参数 |
| --- | --- | --- |
| `request` | 每次有客户端请求的时候触发 | `request <http.IncomingMessage>`<br> `response <http.ServerResponse>`|

| 方法名   | 描述                     |
| -------- | ------------------------ |
| `listen` | 启动 http 服务器监听连接 |

## http.IncomingMessage

`IncomingMessage` 对象由 `http.Server` 或 `http.ClientRequest` 创建，并分别作为第一个参数传给 `request` 和 `response` 事件。 它可用于访问响应状态、标头和数据。

| 属性/方法                                      | 描述             |
| ---------------------------------------------- | ---------------- |
| （以下仅适用于从 `http.Server` 获得的请求 ）       |                  |
| `message.url`                                  | 请求的网址字符串 |
| `message.method`                               | 请求方法的字符串 |
| （以下仅对从 `http.ClientRequest` 获得的响应有效） |                  |
|  |  |

## http.ServerResponse

此对象由 HTTP 服务器内部创建，而不是由用户创建。 它作为第二个参数传给 `request` 事件。
|属性/方法|描述|
| --- | --- |
|`response.end([data[, encoding]][, callback])`|此方法向服务器发出信号，表明所有响应头和正文都已发送；该服务器应认为此消息已完成。`response.end()`方法必须在每个响应上调用。<br>如果指定了`data`，则其效果类似于调用`response.write(data, encoding)` 后跟 `response.end(callback)`。<br>如果指定了`callback`，则将在响应流完成时调用。|
|`response.setHeader(name, value)`| 为隐式标头设置标头值 |
