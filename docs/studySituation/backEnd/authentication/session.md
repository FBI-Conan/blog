# Session

相比于 Cookie 是直接在客户端存储信息，在**服务端存储信息**的 Session 更为安全。认证成功之后，服务端会保存相关的数据，比如用户信息、认证时间、登陆状态等，并关联一个唯一 sessionId，将这个 id 发送给客户端保存起来，下次客户端请求时携带上该 id ，服务端通过该 id 去判断用户状态（比如登陆状态）。

## 客户端的 sessionId 存储

1. cookie
2. storage -> url 或者 header 携带

## 服务端的 Session 数据存储

1. 内存
2. 文件
3. 数据库