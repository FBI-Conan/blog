# jsonwebtoken

`v8.5.1`

## 安装与使用

```
$ yarn add jsonwebtoken
```

```js
const jsonwebtoken = require('jsonwebtoken');

...

app.post('/api/login', (req, res) => {
  const user = req.body;
  if(user.username === 'admin' && user.password === 'admin123') {
    res.send({
      status: 1,
      message: '登陆成功！',
      token: jsonwebtoken.sign(
        {username: user.username},
        'secret-string',
        {expiresIn: '30s'}, // expiresIn 设置 token 有效时间
      ) // 调用 sign 方法生成 token 字符串
    })
  }
})
```
