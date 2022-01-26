# 类型

## string

字符串类型

```ts
let a: string;
a = "hello";

// 直接赋值的情况， TS 会进行类型推断，此时就不用显示的声明了
let b = "word"; // let b: string
```

## number

数字类型

## boolean

布尔值类型

## any

任意类型（**_不推荐使用_**）

```ts
/**
 * 1. any 表示的是任意类型，一个变量设置类型为 any 后相当于对该变量关闭了 TS 的类型检测
 * 2. 声明变量(不赋值)不指定类型，则 TS 解析器会自动判断变量的类型为 any (隐式的any)
 * 3. any 类型的变量可以赋值给其他类型的变量，这样就可能对其他类型的变量产生“污染”
 */
let a: any;

let b; // let b: any
b = "hello";
b = 2;

let num = 1; // let num: number
num = b; // num = 2
```

## unknown

类型安全的 any

```ts
// unknown 实际上就是一个类型安全按的any，unknown类型的变量不能直接赋值给其他变量
let a: unknown;
a = "hello";
a = 2;

let num = 1;
// num = a; // 该行代码会报错： unknown 类型的变量不能赋值给 number 类型变量

/**
 * 类型断言，可以用来告诉解析器变量的实际类型（人工保证）
 * 语法：
 * 		变量 as 类型
 *  	<类型>变量
 */
num = <number>a; // 断言变量 a 就是数字类型
```

# void

空值类型。用于表示函数的函数不返回值。而在`JavaScript`中，函数不返回值代表返回`undefined`，但是在`TypeScript`中`void`不等于`undefined`。

[参考文档](https://www.typescriptlang.org/docs/handbook/2/functions.html#void)

```ts
// 当一个确切的函数定义返回值为 void 类型时，其不应该有返回值
const fcn = (): void => {
	// ...
	// return 1 // 报错（不能有返回值）
};

// 当函数的返回值为 void 类型时，会产生一些奇怪但又合理的现象
// 返回类型为void的上下文归类不会强制函数不返回任何内容
type voidFunc = () => void;

const f1: voidFunc = () => {
	return true;
};

const f2: voidFunc = () => true;

const f3: voidFunc = function () {
	return true;
};

// 上述函数的执行结果赋值给某变量，该变量的类型也为 void
const v1 = f1(); // const v1: void

const v2 = f2(); // const v2: void

const v3 = f3(); // const v3: void

// 如下就是奇怪又合理的一个实例， Array.prototype.push 返回一个数字，而Array.prototype.forEach 方法期望的是一个返回值为 void 的函数
const src = [1, 2, 3];
const dst = [0];

src.forEach(el => dst.push(el));
```

## never

表示函数永远不会返回值，也意味着函数将会抛出异常以终止程序执行或者函数永远不可能返回值（无限循环）。变量也可能存在`never`类型，就是当它们被永不为真的类型所约束时。

`never`类型是任何类型的子类型，可以赋值给任何类型。但是`never`没有子类型，任何类型都不能赋值给`never`类型，包括`any`类型。

```ts
// 抛出错误
function fail(msg: string): never {
	throw new Error(msg);
}

// 无限循环
function infiniteLoop(): never {
	while (true) {}
}

// 不可能存在既是 string 类型，又是 number 类型的变量
let a: string & number; // let a: never
```

## object

任意的`JavaScript`对象类型（直接使用意义不大）

```ts
let obj: object;
obj = {};
obj = () => {};
```

正确使用方式：

```ts
// 定义对象中属性的类型才是经常需要的约束
// [propName: string]: unknown 表示任意类型的属性
let obj: { name: string; [propName: string]: unknown };
obj = { name: "conan", age: 18 };
return {
	obj,
};
```

## Function

函数类型（同`object`类型一样，不直接定义为`Function`类型）

```ts
// 正确用法：上下文归类
// TypeScript类型检查器使用 add 函数的类型来推断右边函数表达式的类型
// 不一致则会报错
let add: (x: number, y: number) => number;
add = function (a, b) {
	return a + b;
};
```

## Array

数组类型

```ts
/**
 * 语法： Array<类型>  或者  类型[]
 */
const numbers: Array<number> = [1, 2, 4];
const strs: string[] = ["hello", "vuepress"];
```

## Tuple

元组类型。元组类型是数组类型的另一种分类，精确的知道数组的**元素个数**及**各个元素的类型**。

```ts
/**
 * 语法： [类型, 类型， ...]
 */
const conanInfo: [string, number] = ["conan", 25];
```

## enum

枚举类型

```ts
// 1.数字型枚举，可以不用定义初始值，支持常量及计算值
enum Gender {
	man, // 0
	woman, // 1
	unknown, // 2
}
console.log(Gender.man); // 0
console.log(Gender[0]); // man

enum Gender2 {
	man = 1,
	woman, // 2
	unknow = "123".length, // 3
	privary = 1 << 2, // 4 ()
}

// 2. 字符串型枚举，每一个成员必须初始化，不允许出现计算值
const fcn: () => string = () => "hello";
enum Gender4 {
	man = "MAN",
	woman = "WOMAN",
	unknown = "UNKNOWN",
	// privary = fcn(), //不允许出现计算
}
console.log(Gender4);

// 3. 混合型枚举，同字符串型枚举，每个成员必须初始化，不允许出现计算值
enum Gender3 {
	man = 1,
	woman = "WOMAN",
	unknown = 3,
}
// 枚举其实就是一个对象
// 绑定数字的成员除了成员属性，还会在该对象中有对应数字的属性
// 而绑定字符串的成员则只有成员属性自身
console.log(Gender3);
// {1: 'man', 3: 'unknown', man: 1, woman: 'WOMAN', unknown: 3}
```

## 联合类型(union types)

typescript 允许使用各种运算符从现有的类型中构建新的类型。联合类型是由两个或多个其他类型组成的类型。

```ts
// 表示 Id 类型的值可是能 number 和 string 中的任意一个
type Id = number | string; // type 是类型别名的语法，表示 联合类型 number | string 的名称是 Id
```
