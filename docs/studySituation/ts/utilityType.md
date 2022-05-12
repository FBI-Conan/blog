# 类型工具

```ts
/**
 * Partial<Type>
 * 构建一个 Type 中所有属性都是可选项的类型
 */
// type T1 = { name?: string; age?: number }
type T1 = Partial<{ name: string; age: number }>;
export type MyPartial<Type> = { [Property in keyof Type]?: Type[Property] };

/**
 * Required<Type>
 * 构建一个 Type 中所有属性都是必填项的类型
 */
// type T2 =  { name: string; age: number }
type T2 = Required<T1>;
export type MyRequired<Type> = {
	[Property in keyof Type]-?: Type[Property];
};

/**
 * Readonly<Type>
 * 构建一个 Type 中多由属性都设为 readonly 的类型
 */
// type T3 = { readonly name: string; readonly age: number }
type T3 = Readonly<T2>;
export type MyReadonly<Type> = {
	readonly [Property in keyof Type]: Type[Property];
};

/**
 * Record<Keys, Type>
 * 构建一个对象类型，其属性键 Keys，属性值是 Type
 */
// type T4 = { name: string, gender: string }
type T4 = Record<"name" | "gender", string>;
// 其中的 keyof any 等同于 number | string | symbol，因为属性键的类型只能是这三种
export type MyRecord<Keys extends keyof any, Type> = {
	[Property in Keys]: Type;
};

/**
 * Pick<Type, Keys>
 * 通过从 Type 中选取属性集 Keys 来构造类型
 */
// type T5 = { readonly name: string }
type T5 = Pick<T3, "name">;
type MyPick<Type, Keys extends keyof Type> = {
	[Property in Keys]: Type[Property];
};

/**
 * Exclude<UnionType, ExcludedMembers>
 * 通过排除 UnionType 中所有可分配给 ExcludedMembers 的联合成员构建新的类型
 */
// type T6 = "age"
type T6 = Exclude<"name" | "age", "name">;
type MyExclude<UnionType, ExcludedMembers> = UnionType extends ExcludedMembers
	? never
	: UnionType;

/**
 * Omit<Type, Keys>
 * 通过从 Type 中选取所有属性，然后删除 Keys 来构造类型。
 */
// type T7 = { readonly gender: string }
type T7 = Omit<T5, "name">;
type MyOmit<Type, Keys extends keyof any> = Pick<
	Type,
	Exclude<keyof Type, Keys>
>;
// 不用 Pick 实现的方式: 会丢失 readonly ? 等修饰符
// 因为 Property 没有直接在 in 语句的时候拿到 keyof Type 的结果
// type MyOmit<Type, Keys extends keyof any> = {
// 	[Property in Exclude<keyof Type, Keys>]: Type[Property];
// };

/**
 * Extract<Type, Union>
 * 提取 Type 中可以分配给 Union 的类型
 */
// type T8 = "name"
type T8 = Extract<"name" | "age", "name" | "gender">;
type MyExtract<Type, Union> = Type extends Union ? Type : never;

/**
 * NonNullable<Type>
 * 从类型 Type 中排除 null 和 undefined 两类型
 */
// type = number | "name"
type T9 = NonNullable<"name" | number | undefined | null>;
// type Res = undefined extends null ? true : false <==> type Res = true;
type MyNonNullable<Type> = Type extends null ? never : Type;

/**
 * Parameters<Type>
 * 将函数类型 Type 中的参数类型组成一个元组
 */
// type T10 = [param: number]
type T10 = Parameters<(param: number) => never>;
type MyParameters<Type extends (...args: any) => any> = Type extends (
	...args: infer Params
) => any
	? Params
	: never;

/**
 * ConstructorParameters<Type>
 * 将构造函数类型 Type 中的参数类型组成一个元组
 */
// type = [name: string, age: number]
type T11 = ConstructorParameters<{ new (name: string, age: number): object }>;
type MyConstructorParameters<Type extends abstract new (...args: any) => any> =
	Type extends abstract new (...args: infer Params) => any ? Params : never;

/**
 * ReturnType<Type>
 * 获取函数类型的返回值类型
 */
// type T12 = number
type T12 = ReturnType<() => number>;
type MyReturnType<Type extends (...args: any) => any> = Type extends (
	...args: any
) => infer Return
	? Return
	: never;

/**
 * InstanceType<Type>
 * 获取构造函数类型 Type 的实例类型
 */
class Person {
	constructor(public name: string, public age: number) {}
}
// type T13 = Person
type T13 = InstanceType<typeof Person>;
type MyInstanceType<Type extends abstract new (...args: any) => any> =
	Type extends abstract new (...args: any) => infer Return ? Return : never;

/**
 * ThisParameterType<Type>
 * 获取类型 Type 的 this 参数类型, 没有指定 this 类型或 Type 不是函数类型则返回 unknown
 */
// type T14 = Person
type T14 = ThisParameterType<(this: Person) => void>;
type MyThisParameterType<Type> = Type extends (
	this: infer ThisType,
	...args: any
) => any
	? ThisType
	: unknown;

/**
 * OmitThisParameter<Type>
 * 移除类型 Type 中的 this 参数类型
 */
// type T15 = () => void;
type T15 = OmitThisParameter<(this: Person) => void>;
type MyOmitThisParameter<Type> = Type extends (
	this: infer ThisType,
	...args: infer Params
) => infer Return
	? unknown extends ThisType
		? Type
		: (...args: Params) => Return
	: Type;

/**
 * ThisType<Type>
 * 此类型不返还转换后的类型, 充当上下文 this 的标志
 * 必须启用 noImplicitThis 才能使用 ThisType
 * ThisType<T> 标记接口只是一个在 lib.d.ts 中声明的空接口。
 * 除了在对象字面量的上下文类型中被识别之外，接口的行为类似于任何空接口。
 */

type ObjectDescriptor<D, M> = {
	data?: D;
	methods?: M & ThisType<D & M>; // Type of 'this' in methods is D & M
};

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
	let data: object = desc.data || {};
	let methods: object = desc.methods || {};
	return { ...data, ...methods } as D & M;
}

let obj = makeObject({
	data: { x: 0, y: 0 },
	methods: {
		moveBy(dx: number, dy: number) {
			this.x += dx; // Strongly typed this
			this.y += dy; // Strongly typed this
		},
	},
});
```
