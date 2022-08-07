# 类型操作

用其他类型来表达类型。

## 泛型

参看[泛型](/studySituation/ts/generics.md)

## keyof 类型操作符

**索引类型查询操作符**，获取对象类型的字符串或数字字面量键值（*公有*键名）。

```ts
type Point = { x: number; y: number };
// "x" | "y"
type P = keyof Point;
```

如果对象类型有索引签名，`keyof`将改为返回这些类型：

```ts
type Arrayish = { [n: number]: unknown };
// type A = number
type A = keyof Arrayish;

type Mapish = { [k: string]: boolean };
// type M = string | number ，因为 js 的数字对象键也会被转换为字符串
type M = keyof Mapish;
```

## typeof 类型操作符

该 `typeof` 不同于 js 中本来就提供的 typeof，ts 中的 `typeof` 使用在*类型上下文*中，后面跟着的是*变量名称或其属性*。

```ts
let s = "hello";

// ts 添加了 typeof 用于在类型上下文中引用变量或属性的类型
let n: typeof s; // let n: string
```

`ReturnType<T>`可以获得函数类型的返回值类型，因此 `T` 必须满足 `(...args: any) => any` 这样的函数类型。

```ts
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>; // type K = boolean
```

如果直接在函数名称上使用 `ReturnType` 会报错，切记 `ReturnType` 是获取*函数类型*的返回值类型，而 `typeof` 才是返回变量或其属性的类型，因此两者可以搭配使用。

```ts
function f() {
	return { x: 10, y: 3 };
}
type P = ReturnType<f>; // 报错：'f' refers to a value, but is being used as a type here. Did you mean 'typeof f'?

// 正确方式
type Q = ReturnType<typeof f>; // type Q = {x: number, y: number}
```

## 索引访问类型 T[K]

使用*索引访问类型*来查找某一类型上的特定属性（该属性特指类型），语法：`T[K]`

```ts
type Person = { age: number; name: string; alive: boolean };

// 注意 "age" 是类型
// const ageVar = "age"; Person[ageVar] 会报错：ageVar 表示值，但在此处用作类型
type Age = Person["age"]; // type Age = number
```

`T[number]`表示类型 T 的数字索引类型：

```ts
type MyType = { name: string; [index: number]: string };
type NumberType = MyType[number]; // type NumberType = string

// 经常可以用来获取数组中元素的类型
const persons = [
	{ name: "conan", age: 18 },
	{ name: "heiji", age: 17 },
];
// 搭配 typeof 获取变量类型
type Person = typeof persons[number]; // type Person = { name: string; age: number }
```

## 条件类型

常用语法：

```ts
// 当 extends 左侧的类型继承自右侧的类型时，获得第一个分支类型（“true”分支），否则，获得后一个分支类型（“false”分支）
SomeType extends OtherType ? TrueType : FalseType;
```

示例：

```ts
// 获取对象类型中的数字索引类型
type Flat<T> = T extends { [index: number]: unknown } ? T[number] : never;

type Ob = {
	[index: number]: string;
};

type F = Flat<Ob>; // type F = string
type A = Flat<number[]>; // type A = number
```

### infer 关键字

用于在条件类型中推断（声明）所需的类型，不用再手段的获取。

```ts
// 不使用 infer 关键字去获取函数类型的返回值类型，需要手动调用 ReturnType<T> 获取返回值类型
// type Return<T> = T extends (...args: unknown[]) => unknown ? ReturnType<T> : T;

// 使用 infer 直接声明返回值类型为 ResType
type Return<T> = T extends (...args: unknown[]) => infer ResType ? ResType : T;

interface F {
	(): number;
}

type FF = Return<F>;
```

### 分布特性

条件类型搭配***泛型***执行时，若泛型是联合类型，则会产生分布特性（且泛型位于 extends 左侧）：

```ts
type ToArray<T> = T extends unknown ? T[] : never;

// 等同于 ToArray<string> | ToArray<number>
type StrOrNumArr = ToArray<string | number>; // type StrOrNumArr = string[] | number[]
```

通常，分布性是期望的行为。如果要避免这种特性，可以用方括号将 `extends` 关键字的每一侧括起来。

```ts
type ToArray<T> = [T] extends [unknown] ? T[] : never;

type StrOrNumArr = ToArray<string | number>; // type StrOrNumArr = (string | number)[]
```

## 映射类型

映射类型基于索引类型的语法构建，搭配 `in` 关键字循环访问键以创建类型：

语法：

```ts
// 联合类型通常是通过 keyof 关键字获取的，当然也可以不是
{
  [Property in 联合类型]: 值类型
}
```

示例：

```ts
type Person = {
	name: string;
	gender: string;
};

// type MT = {name: string, gender: string}
type MT = {
	[Property in keyof Person]: string;
};
```

使用 `as` 重命名键：

```ts
type Convert<T> = {
	[Property in keyof T as `get${Capitalize<
		string & Property
	>}`]: () => T[Property];
};

/* type X = {
     getName: () => string;
     getGender: () => string;
   }
*/
type X = Convert<Person>;
```

映射过程中可以增加 `+`（默认） 或者去除 `-` 修饰符 `readonly` 和 `?`：

```ts
// 移除类型属性的 'readonly' 修饰符
type CreateMutable<Type> = {
	-readonly [Property in keyof Type]: Type[Property];
};

type LockedAccount = {
	readonly id: string;
	readonly name: string;
};

type UnlockedAccount = CreateMutable<LockedAccount>; // type UnlockedAccount = {id: string; name: string;}

// 移除类型属性的 '?' 修饰符
type Concrete<Type> = {
	[Property in keyof Type]-?: Type[Property];
};

type MaybeUser = {
	id: string;
	name?: string;
	age?: number;
};

type User = Concrete<MaybeUser>; // type User = { id: string; name: string; age: number; }
```

## 模板字符串类型

语法与 js 中的模板字符串相同，但是用于*类型*位置。

```ts
type X = "world";

type Y = `hello ${X}`; // type Y = "hello world"
```

插值位置是联合类型，则得到的是每个联合类型成员单独赋值的集合（联合类型）。

```ts
type X = "world" | "NanFeng";

type Y = `hello ${X}`; // type Y = "hello world" | "hello NanFeng"
```

若存在多个插值位置，各个插槽位置将交叉相乘得到最终的联合类型。

```ts
type X = "M" | "N";
type Y = "P" | "Q";

type Z = `${X}_${Y}`; // type Y = "M_P" | "M_Q" | "N_P" | "N_Q"
```

<br />
实例：实现一个监听对象属性变化的事件，事件名是'对象属性+Changed'，回调函数中传入变化后的新值：

```ts
type PropEventSource<T> = {
	// on 函数使用泛型，是为在回调函数中能够保留 T[Key] 类型的信息
	readonly on: <Key extends string & keyof T>(
		// eventName: `${string & keyof T}Changed`,
		eventName: `${Key}Changed`,
		callback: (newVal: T[Key]) => void
	) => void;
};

function makeWatchObject<T extends object>(obj: T): T & PropEventSource<T> {
	type TProp = string & keyof T;
	// 所需监听的属性及其回调函数储存格式
	type EventHubs = {
		[Property in TProp]?: (value: T[Property]) => void;
	};
	// 储存所需监听的属性及回调函数
	const changedHubs: EventHubs = {};

	// 监听函数
	const watchProps: PropEventSource<T>["on"] = (eventName, callback) => {
		const propName = eventName.slice(0, -7) as TProp;
		// 将需要监听的属性存储起来
		changedHubs[propName] = callback as EventHubs[TProp];
	};

	// 需要返回的原生对象（后续需要进行代理）
	const watchObject_temp = {
		...obj,
		on: watchProps,
	};

	return new Proxy(watchObject_temp, {
		set(target, p: string & keyof T, value, receiver) {
			// on 方法具有 readonly 修饰符，不用担心变化
			const newVal = value;
			const oldVal = target[p];
			let refRes = false;
			refRes = Reflect.set(target, p, value, receiver);
			if (newVal !== oldVal) {
				const callback = changedHubs[p];
				// 如果有监听变化的回调函数，则触发它
				if (callback) {
					callback(newVal);
				}
			}
			return refRes;
		},
	});
}

// 代理并提供监听属性变化的API：on(eventName, callbak)
const person = makeWatchObject({
	name: "conan",
	age: 18,
	gender: "man",
});

person.on("nameChanged", params => {
	console.log(params);
});

person.name = "heiji"; // person.name 发生变化，控制台输出变化后的值 heiji
```

### 内部字符串操作类型

为了帮助进行字符串操作，TypeScript 包含了一组可用于字符串操作的类型。这些类型内置于编译器中执行，在 TypeScript 附带的 `.d.ts` 文件中找不到。

| 类型                       | 描述                                       |
| -------------------------- | ------------------------------------------ |
| `Uppercase<StringType>`    | 将字符串中的每个字符转换为大写版本         |
| `Lowercase<StringType>`    | 将字符串中的每个字符转换为等效的小写字符   |
| `Capitalize<StringType>`   | 将字符串中的第一个字符转换为等效的大写字符 |
| `Uncapitalize<StringType>` | 将字符串中的第一个字符转换为等效的小写字符 |
