# 泛型

## 介绍

泛型就是**参数化类型**，数据类型不明确指定，由用户根据自己的数据类型来使用由泛型创建的函数、类、接口等。

- 示例

需求：创建一个返回所传入参数值的函数。

```ts
// T 是类型变量，用来捕获用户传入的类型以供使用
// 如果传入的 arg 类型是 number，那么 T 就是 number
function identity<T>(arg: T): T {
	return arg;
}
```

- 使用方法

  1. 参数所有的参数，包含类型参数

  ```ts
  // 指明 T 就是 string 类型
  identity<string>("hello generics");
  ```

  2. 利用类型推断，不指明 T

  ```ts
  // 根据传入的参数类型是 string，推断 T 的类型为 string
  identity("hello generics");
  ```

## 泛型类型

1. 泛型函数的类型

泛型函数的类型与非泛型函数的类型没什么不同，只是有一个类型参数在最前面，像函数声明一样：

```ts
function identity<T>(arg: T): T {
	return arg;
}
let myIdentity: <T>(arg: T) => T = identity;
```

2. 泛型接口

```ts
// 函数类型接口（带有调用签名的对象字面量）
interface GeneriscIdentityFn {
	<T>(arg: T): T;
}
// 也可以将类型变量 T 当作整个接口的类型变量
interface GeneriscIdentityFn2<T> {
	(arg: T): T;
}

let myIdentity2: GeneriscIdentityFn = identity;
```

## 泛型类

泛型类看上去与泛型接口差不多，使用<>括起泛型变量，跟在类名后面

```ts
class GeneticsVarType<T> {
	// 声明变量类型，未定义
	zeroValue: T;
	add: (x: T, y: T) => T;
}

// 指定类型变量为string
const geneticsString = new GeneticsVarType<string>();
geneticsString.zeroValue = ""; // zeroValue变量 满足 string 类型的要求
geneticsString.add = (x: string, y: string): string => x + y; // add 方法满足 (x: string, y: string) => string 函数类型的要求

// 指定类型变量为number
const genericsNumber = new GeneticsVarType<number>();
genericsNumber.zeroValue = 0;
genericsNumber.add = (x: number, y: number): number => x + y;
```

## 泛型约束

```ts
interface LengthWise {
	length: number;
}

function loggingIdentity<T extends LengthWise>(arg: T) {
	console.log(arg.length); // 通过约束 T ，保证 arg 中必有 length 属性，所以才不会报错
	return arg;
}

loggingIdentity({ name: "desk", length: 1.5 });
```
