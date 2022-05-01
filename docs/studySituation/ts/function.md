# 函数

关于函数的更多信息。

## 函数类型表达式

函数类型表达式（Function Type Expressions）是描述函数的最简单的办法。

**语法**

```ts
// (参数: 参数类型) => 返回值类型
(a: string) => void;
```

**示例**

```ts
// 函数类型表达式
type Fcn = (a: string) => void;

const printString: Fcn = (params: string) => {
	console.log(params);
};

printString("hello"); // hello
```

## 调用签名

在 JavaScript 中，函数除了可调用之外还可以具有属性。但是，**函数类型表达式语法不允许声明属性**。如果我们想描述可调用且具有属性的函数，我们可以在**对象类型中编写调用签名**（Call Signatures）：

**语法**

```ts
// { (参数: 参数类型): 返回值类型 }
{
  (a: string) : void
}
```

**示例**

```ts
// 调用签名就是使用对象的这种形式去声明函数，
// 签名还可以顺带声明属性
type DescribableFunction = {
	description: string;
	(someArg: number): boolean;
};
function doSomething(fn: DescribableFunction) {
	// 访问 fn.description 属性与直接调用函数 fn(6)
	console.log(fn.description + " returned " + fn(6));
}
```

## 构造签名

JavaScript 函数也可以使用 new 运算符调用。可以通过在**调用签名前面添加 new 关键字来编写构造签名**（Construct Signatures）：

**语法**

```ts
// { new (参数: 参数类型): 对象类型 }
{
  new (a: string) : SomeObject
}
```

**示例**

```ts
type SomeConstructor = {
	new (s: string): SomeObject;
};
function fn(ctor: SomeConstructor) {
	return new ctor("hello");
}
```

## 泛型函数

**语法**

```ts
// 指定的类型参数 <T> 在参数列表左侧
function f<T>(params: T): T {
	return params;
}

const ff = <T>(params: T): T => {
	return params;
};
```

**注意点**

- 如果可能，请使用类型参数本身，而不是约束它

```ts
function firstElement1<Type>(arr: Type[]) {
	return arr[0];
}

function firstElement2<Type extends any[]>(arr: Type) {
	return arr[0];
}

// a: number (good)
const a = firstElement1([1, 2, 3]);
// b: any (bad)
const b = firstElement2([1, 2, 3]);
```

- 始终使用尽可能少的类型参数

```ts
function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
	return arr.filter(func);
}

function filter2<Type, Func extends (arg: Type) => boolean>(
	arr: Type[],
	func: Func
): Type[] {
	return arr.filter(func);
}
```

- 如果类型参数仅出现在一个位置，请重新考虑是否确实需要它

```ts
function greet<Str extends string>(s: Str) {
	console.log("Hello, " + s);
}

greet("world");

// 可以很容易的编写一个更简单的版本
function greet(s: string) {
	console.log("Hello, " + s);
}
```

- 为回调编写函数类型时，切勿编写可选参数，除非您打算在不传递该参数的情况下调用该函数

```ts
// 回调函数 callback 中的 index 无需设置为可选
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
	for (let i = 0; i < arr.length; i++) {
		callback(arr[i], i);
	}
}
```

## 函数重载

在 TypeScript 中，我们可以通过编写重载签名（overload signatures）来说明函数可以以不同的方式调用。为此，编写一些数量的函数签名（**通常为两个或多个，称为重载签名**），后跟函数的主体（具有**实现签名**）：

```ts
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
	if (d !== undefined && y !== undefined) {
		return new Date(y, mOrTimestamp, d);
	} else {
		return new Date(mOrTimestamp);
	}
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3); // No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.
```

**注意点**

- 编写重载函数时，应在函数实现上方始终具有两个或多个签名
- 实现签名还必须与重载签名兼容
- 无法直接调用实现签名，只能将函数调用解析为单个重载，即调用函数的时候，调用方式必须符合重载签名之一
- 尽可能选择具有并集类型的参数，而不是重载

## 剩余参数和扩展参数

- 剩余参数

剩余参数隐式具有 `any[]` 而不是 `any`，并且给定的类型批注也必须是 `Array<T>` 或 `T[]` 或 **元组** 的形式。

```ts
// 如下给定的类型为 Array<number> 的形式
function multi(m: number, ...n: Array<number>) {
	return n.map(val => m * val);
}
```

- 扩展参数

扩展参数必须具有元组类型或者传递给剩余参数。

```ts
// 传递给剩余参数，Array.prototype.push() 具有剩余参数，可以传任意多的参数
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);

// 不传递给剩余参数也非元组类型会报错
// const args = [8, 5];
// const angle = Math.atan2(...args); // A spread argument must either have a tuple type or be passed to a rest parameter.
/* 改进为元组类型 */
const args = [8, 5] as const;
const angle = Math.atan2(...args);
```

## 参数解构

ts 中参数解构时声明类型可以看作对传入的对象参数进行类型声明。

```ts
// js 中
function sum({ a, b, c }) {
  console.log(a + b + c);
}
sum({ a: 10, b: 3, c: 9 });

// ts 中
function sum2({ a, b, c }: { a: number; b: number; c: number }) {
  console.log(a + b + c);
}
```
