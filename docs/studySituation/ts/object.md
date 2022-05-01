# 对象

## 索引签名

- 索引签名*属性类型*必须是“字符串”或“数字”，当然也可以同时支持这两种索引类型，但从数字索引返回的类型必须是从字符串索引返回的类型的子类型。
- 索引签名强制所有类型与其相匹配。

```ts
interface TestInter {
	[index: string]: string | boolean; // index 的类型必须是 string 或者 number
	[index: number]: string; // 同时两种索引器时，数字索引器返回的类型 string 是上面字符串索引器返回的 string | boolean 的子类型
	// age: 17; // 报错：类型“17”的属性“age”不能赋给“string”索引类型“string | boolean”。
}
```

## 扩展类型

通过接口的 extends 语法扩展类型：

```ts
interface I1 {
	name: string;
}

interface I2 {
	age: number;
}

// {name: string, age:number}
interface I3 extends I1, I2 {}
```

通过 & 操作符扩展类型：

```ts
// {name: string, age:number}
type I3 = I1 & I2;
const obj: I3 = {
	name: "",
	age: 17,
};
```

接口 vs &：

两者的不同主要体现在类型发生冲突上

```ts
interface I1 {
	name: string;
	age: string;
}

interface I2 {
	age: number;
}

// 报错
interface I3 extends I1, I2 {} // I1”和“I2”类型的命名属性“age”不完全相同。

// 不报错，类型 I4 的结果为 {name: string, age: string & number}
// 即 {name: string, age: never}
type I4 = I1 & I2;
```

::: tip & 的注意点

- any 类型与其他类型的交集还是 any，比如 `number & any` 的结果还是 `any`
- unknown 类型与其他类型的交集还是其他类型本身，比如 `number & unknown` 的结果还是 `number`
  :::

## ReadonlyArray

`ReadonlyArray`是一种特殊类型，用于描述不应更改的数组。等同于在所有属性前面加了`readonly`关键字：

```ts
function doStuff(values: ReadonlyArray<string>) {
	// We can read from 'values'...
	const copy = values.slice();
	console.log(`The first value is ${values[0]}`);
	// ...but we can't mutate 'values'.
	// values.push("hello!"); //报错： Property 'push' does not exist on type 'readonly string[]'.
}
```

`ReadonlyArray`不同于 `Array`，只是 ts 提供的一种类型，不是类。

```ts
// 报错 `ReadonlyArray' only refers to a type, but is being used as a value here.
new ReadonlyArray("red", "green", "blue");
```

相反，可以将常规数组赋值给`ReadonlyArray`类型的数组：

```ts
const roArray: ReadonlyArray<string> = ["red", "green", "blue"];
```

正如 TypeScript 为 `Array<Type>` 提供简写语法 `Type[]` 一样，它也为 `ReadonlyArray<Type>` 提供了简写语法 `readonly Type[]`。

```ts
// values: ReadonlyArray<string>
function doStuff(values: readonly string[]) {
	// values.push("hello!"); // 报错，values 没有 push 属性
}
```

ReadonlyArray 和 Array 类型的值之间赋值不是双向的：

```ts
let arr: readonly number[] = [];

arr = [1, 2, 4];
arr = [2, 3, 4]; // 普通数组类型可以赋值给 ReadonlyArray 类型

let arr2: number[] = [];

arr2 = [1, 3, 4];
// ReadonlyArray 类型的数组不能赋值给普通类型
// arr2 = arr; // 报错：类型 "readonly number[]" 为 "readonly"，不能分配给可变类型 "number[]"
```

## 元组类型

- 元组类型支持可选元素 `?`，且可选元素只能出现在末尾，且会影响元组的 length ：

```ts
// ? 放置在最后一个元素类型之后
type Either2dOr3d = [number, number, number?];
function setCoordinate(coord: Either2dOr3d) {
	const [x, y, z] = coord;
	console.log(`Provided coordinates had ${coord.length} dimensions`);
}
```

- 元组类型支持剩余参数 `...`

```ts
// 前两个元素分别是 string 和 number，但后面可能有任意数量的 boolean 的元组
type StringNumberBooleans = [string, number, ...boolean[]];
// 第一个元素是 string，然后是任意数量的 boolean，并以 number 结尾的元组
type StringBooleansNumber = [string, ...boolean[], number];
// 起始元素是任意数量的 boolean，并以 string， number 结尾的元组
type BooleansStringNumber = [...boolean[], string, number];
```

- 元组类型具有 `readonly` 变体，可以通过在它们前面粘贴一个 `readonly` 修饰符来指定 - 就像数组简写语法一样

```ts
let arr: readonly [string, number, boolean?];

arr = ["conan", 18, true];
```
