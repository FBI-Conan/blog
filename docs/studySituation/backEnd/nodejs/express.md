# Express

Express 是一种高度包容、快速而极简的 Node.js web 框架，属于 Node.js 的第三方模块。

## 基本用法

1. 创建服务，监听客户端 `get` `post` 请求：

```js
const express = require("express");

// 创建服务实例
const app = express();

// 直接挂载路由至服务器实例（不建议） 响应 get 请求
app.get("/api/user", (req, res) => {
	// 向客户端发送响应
	res.send({ name: "Conan", age: 18, gender: "man" });
});

app.get("/api/user/:id", (req, res) => {
	// 请求地址：http://localhost:3000/api/user/001?name=conan
	// req.params 动态参数
	console.log(req.params); // { id: '001' }
	// req.query 查询参数
	console.log(req.query); // { name: 'conan' }
});

// 响应 post 请求
app.post("/api/user", (req, res) => {
	// 默认情况下，如果不配置解析请求体数据的中间件，则 req.body 默认为空
	console.log(req.body); // undefined
	res.send("请求成功！");
});

// 启动服务
app.listen("3000", () => {
	console.log("3000端口服务已启动...");
});
```

2. 托管静态资源

```
├── clock
│   ├── index.html
│   ├── index.js
│   └── index.css
└── server.js
```

```js
// server.js
// ... 启动服务器代码省略

// 静态资源托管 ./clock 目录下的文件，访问路径中默认不包含目录名，如下
// localhost:3000/index.html
// localhost:3000/index.js
// localhost:3000/index.css
app.use(express.static(path.join(__dirname, "./clock")));
```

## 应用

`app` 对象通常表示 `Express` 应用，通过调用 `express()` 创建。

```js
const express = require("express");
const app = express();
```

### app.use

挂载中间件函数或者在指定路径下挂载中间件函数。

格式：`app.use([path,] callback [, callback...])`。

- `path`：路径。如：`'/abcd'` 、 `'/abc?d'` 、 `/\/abc|\/xyz/` 、 `['/abcd', '/xyza', /\/lmn|\/pqr/]`
- `callback`：一个中间件函数、一系列由`,`分隔的中间件函数、中间件函数组成的数组、或者前述的结合

### app.get | app.post

使用指定的回调函数将 HTTP GET / POST 请求路由到指定的路径 。

格式：`app.get(path, callback [, callback ...])` 或者 `app.post(path, callback [, callback ...])`。

- `path`：路径。同 `app.use` 的 path 参数
- `callback`：中间件函数。同 `app.use` 的 callback 参数

## 路由模块化

区别于 `app.METHOD(PATH, HANDLER)` 这种基本路由的形式，其中：

- `app` 是 `express` 的实例
- `METHOD` 是 `HTTP` 请求方法（如 post、 get）
- `PATH` 是服务器上的路径
- `HANDLER` 是在路由匹配时执行的函数

使用 `express.Router` 类来创建可安装的模块化路由处理程序。`Router` 实例是完整的中间件和路由系统。

```js
// routes/user.js 路由器模块

const express = require("express");

// 创建路由实例
const router = express.Router();

// 挂载路由
router.get("/", (req, res) => {
	res.send("get user list");
});

router.post("/", (req, res) => {
	res.send("add new user successful!");
});

module.exports = router;
```

```js
// server.js

const { join } = require("path");
const userRouter = require(join(__dirname, "./routes/user"));

...

// 注册 useRouter（Router实例是完整的中间件和路由系统）
app.use("/api/user", userRouter);
```

## 中间件

中间件函数能够访问请求对象 `req`、响应对象 `res` 以及应用程序的请求/响应循环中的**下一个中间件函数**。下一个中间件函数通常由名为 `next` 的变量来表示。

```js
// server.js

// 定义中间件函数
const mw = (req, res, next) => {
	// 为请求对象添加 _time 属性
	req._time = new Date().toLocaleString();
	next();
};

// 注册中间件
// 没有指定请求方法和路径。应用程序每次收到请求时执行该函数
app.use(mw);

// 没有指定请求方法，但指定了路径。说明在 /user/:id 路径中为任何类型的 HTTP 请求执行此函数
// app.use('/user/:id', mw)

// 指定了请求方法和路径。此函数处理针对 /user/:id 路径的 GET 请求
// app.get('/user/:id', mw)
```

中间件函数可以执行以下任务：

- 执行任何代码
- 对请求和响应对象进行更改
- 结束请求/响应循环
- 调用堆栈中的下一个中间件，即`next`

注：如果**当前中间件函数没有结束请求/响应循环，那么它必须调用 `next()`**，以将控制权传递给下一个中间件函数。否则，请求将保持挂起状态。

::: tip 补充

- 中间件装入顺序很重要：首先装入的中间件函数也首先被执行
- 可以为一个路径定义多个路由：

  ```js
  // , 分隔中间件
  app.use(mw1, mw2);
  app.use(mw3);

  // 中间件数组
  app.get("/user", [mw4, mw5]);
  app.get("/user", mw6);
  ```

:::

### 应用层中间件

使用 `app.use()` 和 `app.METHOD()` 函数将应用层中间件**绑定到应用程序对象的实例**。

### 路由器层中间件

路由器层中间件的工作方式与应用层中间件基本相同，差异之处在于它绑定到 `express.Router()` 的实例。

```js
const express = require("express");

const router = express.Router();

const partWm1 = (req, res, next) => {
	req._time = new Date().toLocaleString();
	next();
};
const partWm2 = (req, res, next) => {
	// ...
	next();
};

// 挂载路由
router.get("/user", [partWm1, partWm2], (req, res) => {
	res.send(req._time);
});
```

### 错误处理中间件

错误处理中间件始终采用**四个自变量**。必须提供四个自变量，以将函数标识为错误处理中间件函数。即使无需使用 `next` 对象，也必须指定该对象以保持特征符的有效性。否则，`next` 对象将被解释为常规中间件，从而无法处理错误。**且在其他 app.use() 和路由调用之后，最后定义错误处理中间件**。

```js
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});
```

### 内置中间件

1. `express.static(root[, options])`

为静态文件提供服务

2. `express.json([options])` v4.16+

解析 json 数据类型的请求

3. `express.text([options])` v4.17+

解析 text 数据类型的请求

4. `express.urlencoded([options])` v4.16+

解析 urlencoded 数据类型的请求

### 第三方中间件

由第三方开发的中间件模块，比如`body-parse`

```js
const bodyParser = require("body-parser");

...

app.use(bodyParser.urlencoded({ extended: false })); // 解析 urlencoded 数据类型的请求
app.use(bodyParser.json()); // 解析 json 数据类型的请求
```

手动实现 `urlencoded` 类型解析的中间件：

```js
app.use((req, res, next) => {
	// 判断是否是 urlencoded 类型的数据
	const isUrlEncoded =
		req.headers["content-type"] === "application/x-www-form-urlencoded";
	if (isUrlEncoded) {
		let str = "";
		// 客户端向服务端传输数据会触发 data 事件
		req.on("data", chunk => {
			str += chunk;
		});
		// 传输结束会触发 end 事件
		req.on("end", () => {
			// str形式 a=b&c=d
			const uSP = new URLSearchParams(str);
			const data = {};
			uSP.forEach((value, key) => {
				data[key] = value;
			});
			req.body = data;
			next();
		});
	}
});
```

## 跨域解决方案-cors

跨域资源共享（Cross-Origin Resource Share）是一种基于 **HTTP 头**的机制，该机制通过允许服务器标示除了它自己以外的其它 origin（域，协议和端口），这样浏览器可以访问加载这些资源。

浏览器必须首先使用 OPTIONS 方法发起一个预检请求（preflight request），从而获知服务端是否允许该跨源请求。服务器确认允许之后，才发起实际的 HTTP 请求。

```js
...

app.use((req, res, next) => {
	// 指定该响应的资源是否被允许与给定的域共享。
	res.setHeader('Access-Control-Allow-Origin', '*');
	// 明确客户端所要访问的资源允许使用的方法或方法列表， 比如 POST GET OPTIONS
	res.setHeader('Access-Control-Allow-Methods', '*');
	// 将会在正式请求的跨域请求头字段中出现的头信息
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
})

```

使用第三方中间件 `cors` 解决：

1. 安装 cors 模块：

```
$ yarn add cors
```

2. 引入模块：

```js
const cors = require('cors');

...

app.use(cors());
```

## 应用程序生成器

可使用应用程序生成器工具 (express-generator) 快速创建应用程序框架。

```
<!-- 当前工作目录中创建名为 myapp 的 Express 应用程序并将视图引擎将设置为 Pug -->
$ npx express-generator --view=pug myapp
```

```
<!-- 安装依赖项 -->
$ cd myapp
$ yarn 或者 npm install
```

```
<!-- 启动应用程序（port = 3000） -->
$ yarn start
```
