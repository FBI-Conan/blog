# JWT

[JWT](https://jwt.io/introduction)（JSON Web Token）标准是 Token 的一种，其他类型的 Token 的还有 SWTs（simple web tokens）和 Security Assertion Markup Language（SAML）tokens。相对于其他两种， JWT 具有更紧凑、更安全、更通用、更易处理的特点[](https://auth0.com/docs/secure/tokens/json-web-tokens)。

## 结构

JTW 由以 `.` 分隔的三部分组成：

- Header
- Payload
- Signature

因此通常看起来为：

`xxxx.yyyy.zzzz`

### Header

Header 一般由两部分组成。token 的类型，即 JWT 。以及所使用签名算法，例如 HMAC SHA256 或者 RSA。

```json
{
	"alg": "HS256",
	"typ": "JWT"
}
```

Base64Url 编码该 JSON 作为 JWT 的第一部分。

### Payload

Payload 是关于实体（通常是用户）和附加信息的描述。

```json
{
	"sub": "1234567890",
	"name": "John Doe",
	"admin": true
}
```

Base64Url 编码该 JSON 作为 JWT 的第二部分。

注：对于已签名的令牌，此信息虽然受到保护以防篡改，但任何人都可以读取。除非已加密，否则请勿将机密信息放入 JWT 的 Payload 或 Header 元素中。

### Signature

签名必须获取 编码后的 Header、编码候得 Payload 和 secret，然后算法必须是 Header 中指明的算法（如使用了 HMACSHA256 算法），然后进行签名：

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

签名用于验证信息有没有被篡改，并且在使用私钥进行签名的情况下，还可以验证 JWT 的发送者就是它所说的那个人。

[jwt.io Debugger](https://jwt.io/#debugger-io)是一个用来解码、验证和生成 JWT 的在线工具。

## 使用

每当用户想要访问受保护的路由或资源时，客户端应该发送 JWT，通常在 **Authorization** 标头中使用**Bearer** 模式。标头的内容应如下所示：
```
Authorization: Bearer <token>
```