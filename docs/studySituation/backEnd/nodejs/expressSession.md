# express-session

`v1.17.2`

## 安装与使用

```
$ yarn add express-session
```

```js
const session = require("express-session");

const options = {
	secret: "shanghaiyiqing",
	resave: false,
	saveUninitialized: true,
};

// 通过给定的 options 创建一个 session 中间件
app.use(session(options));
```

## options

1. cookie

sessionId cookie 的设置对象，默认值：`{ path: '/', httpOnly: true, secure: false, maxAge: null }`。

2. resave

强制每次请求都重新设置 session。默认 `true` ，推荐 `false` 。

3. saveUninitialized

强制将未初始化的 session 保存。默认 `true` 。

4. secret

secret 用于签名 sessionID。必填项。
