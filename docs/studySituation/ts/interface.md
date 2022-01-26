# 接口

TypeScript 的核心原则之一是对值所具有的结构进行类型检查。在 TypeScript 里，接口的作用就是为这些类型命名和为你的代码或第三方代码定义契约。

## 接口初探

最常见的接口使用方式：

```ts
interface myInterface {
	readonly name: string; // 只读属性 readonly 关键词
	gender?: string; // 可选属性 ?
}

// 变量 heiji 实现了接口 myInterface，因此只能定义接口中定义的属性
const heiji: myInterface = {
	name: "heiji",
	// age: 17, //只能指定已知属性
	gender: "man",
};
```

对象字面量额外的属性检查：

```ts
interface myInterface {
	readonly name: string;
	gender?: string;
}

/** 函数的参数 a 需要满足接口的必须条件，不代表参数 a 必须实现接口，然而，对象字面量除外 */
function fcn(a: myInterface) {
	console.log(a.name);
}

// 变量 v 并没有实现 myInterface 接口
const v = {
	name: "conan",
	age: 1,
};

// 变量 v 满足 myInterface 接口的必须条件：具有属性 name，因此不会报错
fcn(v);

fcn({ name: "conan", age: 1 }); // 报错（对象字面量会被特殊对待）：“age”不在类型“myInterface”中。
```

## 接口和类型别名

`interface`（接口） 和 `type`（类型别名） 十分相似，大多数情况下，可以在两者之间自由选择。不同如下：

```ts
/*
	1. ts 4.2 版本之前，错误提示的时候，有时不会显示类型别名的名称，
		只显示类型别名的结果，而接口则在错误提示的时候总是显示名称（提示问题，不必太在意）
*/

/*
	2. 同一名称的接口可以声明多次，结果会合并
		同一名称的类型别名只能声明一次
*/
interface Person {
	name: string;
}
interface Person { // <==> { name:string, age?:number }
	age?: number;
}

type Student {
	name: string
}
// 报错： 标识符“Student”重复。
type Student { 
	score?: number
}

/*
	3. 接口仅可以声明对象的结构，不能重命名基本类型（string, number, boolean）
*/

// 报错： 接口只能扩展具有可选类型参数的标识符/限定名称。
interface MyInter extends number { 

}

type MyType = string; // 可行

```

## 函数类型

接口除了可以描述带有属性的普通对象外，还能够描述函数类型。

```ts
interface addFcn {
	(a: number, b: number): number;
}

const add: addFcn = (a: number, b: number) => {
	return a + b;
};
```

type 版

```ts
type myType = {
	(a: number, b: number): number;
}; // 等同于 type myType = (a: number, b: number) => number

const add2: myType = (a: number, b: number) => {
	return a + b;
};
```

## 类类型

在接口中声明类中需要声明的属性（不强制要求初始化）和实现的方法。

```ts
interface myInter {
	name: string;
	sound(): void;
}

// implements 关键词，这种行为称为 类“实现”了某个接口（一个类可以同时实现多个接口）
class Person implements myInter {
	name: string; // 同继承一样，属性的声明并不要求初始化
	sound() {
		console.log("发声~~~");
	}
}

console.log(new Person().sound()); // 发声~~~
```

## 接口继承

同类一样，接口也可以相互继承。将一个/多个接口的成员复制到另一个接口中。

```ts
interface myInter1 {
	name: string;
}
interface myInter2 {
	age: number;
}

// 接口可以继承其他接口，且可以同时继承多个
interface myInter3 extends myInter1, myInter2 {
	gender: string;
}

const student = <myInter3>{};
student.name = "conan";
student.age = 18;
student.gender = "man";
```

## 接口继承类

当接口继承了一个类类型时，它会继承类的成员但不包括其实现。

```ts
class Person {
	name: string;
	age: number;
	gender: string;
	sayName(): string {
		return this.name;
	}
}

/**
 * 等同于 =>
 * {
 * 		name: string,
 * 		age: number,
 * 		gender: string,
 * 		sayName():string, // 并不提供实现
 * }
 */
interface myInter extends Person {
	hobby: string;
}

const student: myInter = {
	name: "conan",
	age: 18,
	gender: "man",
	hobby: "篮球",
	sayName() {
		return "lalalalal";
	},
};
```

[接口同样会继承到类的 private 和 protected 成员。 这意味着当你创建了一个接口继承了一个拥有私有或受保护的成员的类时，这个接口类型只能被这个类或其子类所实现（implement）](https://www.tslang.cn/docs/handbook/interfaces.html)。
