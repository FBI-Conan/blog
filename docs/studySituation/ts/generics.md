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

泛型类看上去与泛型接口差不多，使用<>括起类型变量，跟在类名后面。**泛型类中的类型变量只针对类的实例，因此静态成员(static)不饿能使用类型变量**。

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

### 在泛型约束中使用类型参数

声明受另一个类型参数约束的类型参数。

```ts
/**
 * 从一个对象中获取其已经存在的属性的值，避免意外获取不存在的属性
 * @param obj 对象
 * @param key 对象上已存在属性
 */
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
	return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
// getProperty(x, "m"); // 报错：对象 x 上不存在属性 m
```

### 在泛型中使用类类型

```ts
/**
 * 创建类实例
 * @param clazz 类
 * @param params 实例化类需要传入的参数所组成的数组
 */
function create<T, K extends Array<unknown>>(
	clazz: { new (...arr: K): T },
	...params: K
): T {
	return new clazz(...params);
}

class MyClass {
	constructor(public name: string, public age: number) {}
}

const obj = create(MyClass, "conan", 17);

console.log(obj); // MyClass { name: 'conan', age: 17 }
```
