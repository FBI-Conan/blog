# Cookie

Cookie 是指某些网站为了辨别用户身份而存储在用户本地终端上的数据，它会在下次向同一服务器再次发起请求时被携带并发送到服务器上。

早期 Cookie 一度用于客户端数据的存储，因为当时并没有其他合适的存储办法而作为唯一的存储手段。现在的浏览器具有 Web Storage Api 和 IndexDB。Cookie 在指定后，浏览器的每次请求都会携带该域下的所有 Cookie 数据，增加了额外的性能开销，且 Cookie 只能存储 4kb 大小的字符串。

## Set-Cookie

服务端使用`Set-Cookie`响应头部向客户端发送 Cookie 信息。`Set-Cookie`响应头可以同时存在多个。

```
Set-Cookie: name=value
```

之后，对服务端发起的每一次新请求都会将之前保存的 Cookie 信息通过 `Cookie` 请求头部再发送给服务器。

```
GET /sample_page.html HTTP/1.1
Host: www.example.org
Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```

## 定义 Cookie 声明周期

```
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT;
```

注：当 Cookie 的过期时间被设定时，**设定的日期和时间只与客户端相关**，而不是服务端。

## 限制访问 Cookie

标记为 `Secure` 的 Cookie 只应通过被 HTTPS 协议加密过的请求发送给服务端。JavaScript `Document.cookie` API 无法访问带有 `HttpOnly` 属性的 cookie；

```
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly
```
