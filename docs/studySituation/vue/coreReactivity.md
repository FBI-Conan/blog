# Vue3 响应式解析

## track 和 trigger

先看一个示例：

```ts
// index.ts
let price = 5; // 单价
let quality = 2; // 质量
let total = 0; // 总价

const effect = () => {
	// 更新总价
	total = price * quality;
};

effect();

console.log(total); // 10

price = 10;

// 当单价改变时，为了及时更新总价，需要再次执行 effect 函数
effect();

console.log(total); // 20
```

从上面的例子我们可以看到，总价是由单价和质量决定的，当单价改变的时候，我们需要再次调用更新总价的函数`effect`（称之为依赖）来保证总价的更新。当然可能还会有`effect2 effect3`多个需要更新的函数，所以我们希望用一个集合去收集他们。

```ts
// index.ts
let price = 5;
let quality = 2;
let total = price * quality;

const dep = new Set<() => void>(); // 用来收集effect

const track = () => {
	// 追踪（收集）effect
	dep.add(effect); // 可能还有 dep.add(effect2)
};
const trigger = () => {
	// 触发 effect 的更新
	dep.forEach(effect => effect());
};

const effect = () => {
	total = price * quality;
};

track();

console.log(total); // 10

price = 10;

trigger();

console.log(total); // 20
```

这样我们就可以在`track`之后，每次只调用一次`trigger`就能完成所有`effect`的调用（更新）。但是上述的`effect`收集器`dep`并没有与属性映射起来，比如哪些`effect`是属于`price`变量的，哪些又是属于`quality`变量的，当某一变量发生改变时，只需要调用映射到的`effect`即可，因此我们定义一个`depsMap`来将属性与`dep`映射起来，并且我们通常会使用对象来收集变量，因此还需要一个对象与`depsMap`之间的映射`targetsMap`：

```ts
// index.ts
type depSet = Set<() => any>;
type KeyToDepMap = Map<string, depSet>;
const product = {
	price: 5,
	quality: 2,
};
let total = product.price * product.quality;
/**
	1. WeakMap 只能使用对象作为键
	2. 当作为键的对象本身不再可以从任何代码访问，即该目标可以被垃圾回收时，它在 WeakMap 中关联的值也会被回收
 */
const targetsMap = new WeakMap<object, KeyToDepMap>();

const track = (target: object, key: string) => {
	let deps = targetsMap.get(target);
	if (!deps) {
		// 建立 target 与 deps 的映射
		targetsMap.set(target, (deps = new Map()));
	}
	let dep = deps.get(key);
	if (!dep) {
		// 建立 key 与 dep 的映射
		deps.set(key, (dep = new Set()));
	}
	// 追踪（收集）effect
	dep.add(effect);
};
const trigger = (target: object, key: string) => {
	const deps = targetsMap.get(target);
	if (!deps) {
		// 没有需要触发的更新(efect())
		return;
	}
	const dep = deps.get(key);
	if (dep) {
		// 触发 effect 的更新
		dep.forEach(effect => effect());
	}
};

const effect = () => {
	total = product.price * product.quality;
};

track(product, "price");

console.log(total); // 10

product.price = 15;

trigger(product, "price");

console.log(total); // 30
```

到此我们就办到了对于任意对象中的属性都能够完成将其对应的`effect`很好的收集管理起来，并且在属性值改变的时候，只需要调用`trigger(target, key)`就能够实现更新。

## reactive

在上一节中已经编写了`track`和`trigger`，它们一个是用来收集依赖，一个是用来触发依赖更新的。但是收集依赖和触发依赖是我们手动去完成的，并不能叫做响应式更新，并且我们在`track`中添加的依赖是写死的。所以我们需要：

1. 自动收集依赖；
2. 收集的依赖必须是变化的，且只在依赖运行的时候去收集（即函数运行时）。

怎么才能自动收集依赖，依赖要随变量的变化进行响应式的更新，肯定是读取了变量的值，因此只需要对变量的读取进行拦截，就可以在恰当的时机将依赖全部收集起来，然后在变量的值改变的时候也进行拦截，将收集到的依赖全部更新即可。还剩最后一个问题：怎么只在依赖运行的时候收集？就比如上述的例子中，只在函数`effect()`调用的时候读取了`product.price`和`product.quality`时收集`effect`，而不在定义`total = product.price * product.quality`收集依赖，我们可以定义中间变量`activeEffect`表示当前正在运行的依赖，而在依赖未运行的时候置空，在`track`追踪依赖的时候中判断一下即可。

```ts
// reactive.ts
import { track, trigger } from "./effect";

export const reactive = function <T extends object>(target: T) {
	const handler = {
		get(_target: T, key: string, receiver: any) {
			track(_target, key);
			return Reflect.get(_target, key, receiver);
		},
		set(_target: T, key: string, value: any, receiver: any) {
			const res = Reflect.set(_target, key, value, receiver);
			trigger(_target, key);
			return res;
		},
	};
	const proxiedTarget = new Proxy(target, handler);
	return proxiedTarget;
};
```

```ts
// effect.ts
type effectFcn = () => any;
type depSet = Set<effectFcn>;
type KeyToDepMap = Map<string, depSet>;
const targetsMap = new WeakMap<object, KeyToDepMap>();

let activeEffect: effectFcn = null;

// 接收并运行依赖，同时管理 activeEffect 变量
export const effect = (fn: effectFcn) => {
	activeEffect = fn;
	/**
	 * activeEffect 运行的时候，会触发代理拦截
	 * 在代理中自动收集 activeEffect 作为依赖
	 */
	activeEffect();
	/**
	 * 依赖收集完成之后置空 activeEffect
	 * 避免其他地方触发代理拦截时继续收集依赖
	 */
	activeEffect = null;
};

export const track = (target: object, key: string) => {
	if (activeEffect) {
		let deps = targetsMap.get(target);
		if (!deps) {
			// 建立 target 与 deps 的映射
			targetsMap.set(target, (deps = new Map()));
		}
		let dep = deps.get(key);
		if (!dep) {
			// 建立 key 与 dep 的映射
			deps.set(key, (dep = new Set()));
		}
		// 追踪（收集）依赖
		dep.add(activeEffect);
	}
};

export const trigger = (target: object, key: string) => {
	const deps = targetsMap.get(target);
	if (!deps) {
		// 没有需要更新的依赖
		return;
	}
	const dep = deps.get(key);
	if (dep) {
		// 更新所有依赖
		dep.forEach(effect => effect());
	}
};
```

```ts
// index.js
import { effect } from "./effect.js";
import { reactive } from "./reactive.js";

const product = reactive({
	price: 5,
	quality: 2,
});
let total = product.price * product.quality;

effect(() => {
	total = product.price * product.quality;
});

console.log(total); // 10

product.price = 15;

console.log(total); // 30

product.quality = 3;

console.log(total); // 45
```

总结起来，就是先对响应式数据进行`Proxy`拦截，依赖在运行时，就会通过`get`拦截将依赖收集起来，响应式数据变化的时候，就能够通过`set`拦截去依次更新依赖。

## ref

之前响应式数据所应用的例子是`product`这种普通对象，对于基本类型的变量**vue3**中使用的`ref`方法。实现`ref`一种简单的方法就是`reactive({value: raw})`，但是有一些不足之处：

1. 从定义来看`ref`之应该暴露一个属性，值就是基本类型变量本身，但是从技术层面上来说`reactive`方法可以有附加的额外属性，这样就违背了`ref`的目的；
2. 性能问题，`reactive`做了更多情况的判断，处理起来更为的复杂，而只通过对象字面量去实现`ref`显然更为明智。

```ts
// ref.ts
import { track, trigger } from "./effect";
export const ref = <T>(raw?: T) => {
	const r = {
		get value(): T {
			track(r, "value");
			return raw;
		},
		set value(val: T) {
			if (raw !== val) {
				raw = val;
				trigger(r, "value");
			}
		},
	};
	return r;
};
```

```ts
// index.ts
import { effect } from "./effect.js";
import { reactive } from "./reactive.js";
import { ref } from "./ref.js";

const product = reactive({
	price: 5,
	quality: 2,
});

let salePrice = ref(product.price * 0.9);
let total: number;

effect(() => {
	total = salePrice.value * product.quality;
});

console.log(total); // 9

salePrice.value = product.price * 0.8;

console.log(total); // 8
```

## computed

为啥上面的`salePrice`和`total`不用`computed`去定义呢？可不是嘛，那`computed`应该如何去实现呢？有点像是`ref`的结果，并且传入的函数中的响应式数据变化时，需要更新结果。

```ts
// computed.ts
import { ref } from "./ref";
import { effect } from "./effect";

export const computed = <T>(fn: () => T) => {
	const res = ref<T>();
	effect(() => {
		res.value = fn();
	});
	return res;
};
```

```ts
import { reactive } from "./reactive";
import { computed } from "./computed";

const product = reactive({
	price: 5,
	quality: 2,
});

const salePrice = computed(() => {
	return product.price * 0.7;
});

const total = computed(() => {
	return salePrice.value * product.quality;
});

console.log(total.value); // 7

product.price = 10;

console.log(total.value); // 14

product.quality = 4;

console.log(total.value); // 28
```
