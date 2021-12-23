# 类

## 面向对象

[维基百科](https://zh.wikipedia.org/zh-my/%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1)定义：**面向对象程序设计**（英语：Object-oriented programming，缩写：OOP）是种具有对象概念的编程典范，同时也是一种程序开发的抽象方针。它可能包含数据、特性、代码与方法。<u>对象则指的是类（class）的实例</u>。它将对象作为程序的基本单元，将程序和数据封装其中，以提高软件的重用性、灵活性和扩展性，对象里的程序可以访问及经常修改对象相关连的数据。在面向对象程序编程里，计算机程序会被设计成彼此相关的对象。

一言以蔽之：<u>**对象中的所有操作都通过对象来进行**</u>。

支持面向对象编程语言通常利用继承其他类达到代码重用和可扩展性的特性。而类有两个主要的概念：

- **类（class）**：定义了一件事物的抽象特点。类的定义包含了数据的形式（属性）以及对数据的操作（方法）。

- **对象**：类的实例。

## 类

### 基础

1. 在**ts**中定义类

```ts
/**
 * 使用 class 关键字定义类
 */
class Person {}

// 生成一个 Person 类的实例 --> 对象
const person = new Person();

console.log(person);
// 输出 Person {}
// 其中 Person 表示 person 对象的类
// {} 表示 person 对象的值
```

2. 在类中定义对象实例的属性和方法

```ts
class Person {
	// 定义属性
	name = "Conan";
	age = 25;

	// 定义方法（方法是放置在实例的原型对象中）
	greeting() {
		console.log("大家好！我的名字叫做" + this.name);
	}
}

const person = new Person();

console.log(person.name); // Conan
console.log(person.age); // 25
person.greeting(); // 大家好！我的名字叫做Conan
console.log(person); // Person { name: 'Conan', age: 25 }
console.log(Object.getPrototypeOf(person)); // { greeting: [Function (anonymous)] }
```

3. 使用构造函数灵活生成对象：

```ts
class Person {
	// 定义属性
	name: string;
	age: number;

	// 构造函数 constructor 会在每次实例化的时候调用，即 new Person() 时调用
	// 实例方法中的 this 指代的就是类实例化生成的对象
	// 因此就可以根据传入的参数 name age 动态的创建不同内容的对象
	constructor(name: string, age: number) {
		this.name = name;
		this.age = age;
	}
}

console.log(new Person("conan", 25)); // Person {name: 'conan', age: 25}
console.log(new Person("heiji", 24)); // Person {name: 'heiji', age: 24}
```

### 继承

继承可以使得子类具有父类别的各种属性和方法，而不需要再次编写相同的代码。

```ts
/**
 * 继承的应用场景：
 * 	 当多个类的具有相同/相似的属性或方法时，可以将这些相同/相似的方法提取出来，作为一个父类/超类/基类
 * 语法（extends关键词）：
 * 	 子类/派生类 extends 父类/超类/基类 {}
 */
class Person {
	// 在 constructor 的形参前加修饰符：如public/protected/private/readonly 时，相当于在类中声明并修饰了 同形参名的属性，并且会在构造函数中自动执行 this.属性名 = 形参
	// readonly name:string;
	// age:number;
	// constructor(readonly name: string, public age: number) {
	// 	this.name = name;
	// 	this.age = age;
	// }
	constructor(readonly name: string, public age: number) {}
	sayHello() {
		console.log("大家好！");
	}
}

/**
 * Chef子类 继承自 Person父类，就拥有 Person父类中定义的所有属性和方法
 * 在 Chef 中再次定义了方法 sayHello，这种形式承为方法的重写（发生在类与类之间，也称为多态）
 */
class Chef extends Person {
	sayHello() {
		console.log("大家好！我是一名厨师，我会炒很好吃的菜。");
	}
}

/**
 * 1. 如果需要在子类中添加新的方法，直接添加即可
 * 2. 如果需要添加新的属性，则必须搭配 super 方法使用，super 代指父类的构造函数，并且子类中只要写了构造函数，就必须调用 super 函数
 */
class Driver extends Person {
	constructor(name: string, age: number, public mileage: number) {
		super(name, age); // super 指代父类
		this.mileage = mileage;
	}
	drive() {
		console.log("我正在开车~~");
	}
}
```

### 抽象类

只用于继承的类，不能够创建实例，用来约束/规范子类。

```ts
/**
 * 抽象类：只能用于继承，不能创建实例
 * 		语法： abstract class 类名 {}
 *
 * 		抽象类中可以定义抽象属性/方法，子类必须对该抽象属性/方法进行实现
 *				语法： abstract 属性名: 类型
 * 							abstract 调用签名
 * 				示例1： abstract icon: string;
 * 				示例2： abstract add(a:number, b:number): number
 */
abstract class Operate {
	abstract icon: string; // 基本上不会在抽象类中定义抽象属性
	abstract operate(a: number, b: number): number;
}
// const operate = new Operate("add"); // 无法创建抽象类的实例

class Add extends Operate {
	// 不定义 icon 属性和 operate 方法的话会报错
	icon = "+";
	operate(a: number, b: number) {
		return a + b;
	}
}

const add = new Add();

console.log(add.icon); // +
console.log(add.operate(1, 1)); // 2
```
