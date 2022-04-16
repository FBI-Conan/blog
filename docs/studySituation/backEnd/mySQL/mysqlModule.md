# mysql 模块

## 安装

```
$ yarn mysql
```

## 建立连接

```js
// mysql.js

const mysql = require("mysql");

const connConfig = {
	host: "localhost", // 主机 IP
	port: "3306", // 端口
	user: "root", // 数据库服务的登录账号
	password: "admin123", // 数据库服务的登录密码
	database: "my_db_01", // 数据库名
	multipleStatements: true,
};

// 创建连接池（此时还未激活与数据库的连接）
const pool = mysql.createPool(connConfig);

// 封装数据库操作函数以供 api 接口使用
// 返回 Promise 实例，方便配合 es7 async-await 语法
const query = (sql, params) => {
	// 处理 params 可省略的情况
	if (typeof params == "function") {
		callback = params;
		params = null;
	}
	return new Promise(resolve => {
		// 每次操作数据库时都重新获取连接，操作完成后就释放，
		// 防止多个长连接共存时造成数据库压力过大
		pool.getConnection((err_connection, connection) => {
			if (err_connection) {
				throw err_connection;
			}
			connection.query(sql, params, (err_query, results, fileds) => {
				// 释放连接
				connection.release();
				// fulfilled 状态，返回结果
				resolve([err_query, results, fileds]);
			});
		});
	});
};

module.exports = { query };
```

## 转义查询值

`query` 方法的第一个参数可以使用 `?` 占位符，然后在第二个参数中指定 `?` 的转义内容：

```js
// 参数二是一个数组，与各个占位符依序对应
connection.query(
	"update user set username = ?, password = ? where id = ?",
	["conan", "moore", 1],
	(err, results) => {}
);

// 如果只有一个占位符，参数二可以不用数组包装
connection.query("select * from user where id = ?", 1, (err, results) => {});
```

不同类型的值转义结果不同：

- 数字保持不变
- 日期转换为 `'YYYY-mm-dd HH:ii:ss'` 字符串
- 嵌套数组变成分组列表（用于批量插入），例如 `[['a', 'b'], ['c', 'd']]` 变成 `('a', 'b'), ('c', 'd')`
- 数组变成列表，例如 `['a', 'b']` 变成 `'a', 'b'`
- 对于对象上的每个可枚举属性，对象都会变成 `key = 'val'` 对。如果属性的值是一个函数，则跳过它；如果属性的值是一个对象，则对其调用 `toString()` 并使用返回的值。例如 `{username: 'conan', password: 'moree'}` 变成 `username = 'conan', password = 'moree'`
- `undefined / null` are converted to `NULL`

## express + mysql

```js
const express = require("express");
const { join } = require("path");
// 引入封装好的 mysql 模块
const connection = require(join(__dirname, "../database/mysql.js"));

const router = express.Router();

// 查
router.get("/", (req, res) => {
	connection.query("select * from users").then(([err, data]) => {
		if (err) {
			res.status(500).send(err.message);
		} else {
			res.send(data);
		}
	});
});

// 增
router.post("/", async (req, res) => {
	const newUserList = Array.isArray(req.body) ? req.body : [req.body];
	connection.query(
		"insert into users set ?;".repeat(newUserList.length),
		newUserList
	).then(([err, data]) => {
		if (err) {
			res.status(400).send(err.message);
		} else {
			res.send(data);
		}
	});
});

// 改
router.put("/:id", (req, res) => {
	connection.query(`update users set ? where id = ?`, [req.body, req.params.id]).then(
		([err]) => {
			if (err) {
				res.status(400).send(err.message);
			} else {
				res.send("更新成功");
			}
		}
	);
});

// 删
router.delete("/:id", (req, res) => {
	connection.query("delete from users where id = ? ", req.params.id).then(
		([err, data]) => {
			if (err) {
				res.status(400).send(err.message);
			} else {
				res.send("删除成功！");
			}
		}
	);
});

module.exports = router;
```
