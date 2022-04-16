# express-jwt

`v6.1.1`

## 安装与使用

```
$ yarn add express-jwt
```

```js
const expressJwt = require("express-jwt");

app.use(
	"/api",
	app.use(
		"/api",
		expressJwt({
			secret: "secret-string",
			algorithms: ["HS256"], // jsonwebtoken 默认的签名算法是 HS256
		}).unless({
			path: ["/api/login"], // path 数组的元素使用正则写法好像不行
		})
	)
); // 对于解析好的 token 内容默认放置在 req.user 中

app.get("/api/user", (req, res) => {
	if (req.user) {
		res.send({ status: 1, message: "请求成功！", username: req.user.username });
	} else {
		res.status(401).send({ status: 0, message: "用户未登录！" });
	}
});
```
