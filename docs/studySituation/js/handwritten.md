# 手写

## Promise

### 回顾 Promise

要手写**Promise**，首先回顾一下**Promise**的用法：

```js
// Promise 接收一个回调函数，且回调函数会自动传入 resolve 和 reject 两个函数作为参数
// resolve 和 reject 用来改变 Promise 实例的状态
// resolve： pending --> fulfilled
// reject： pending --> rejected
const p = new Promise((resolve, reject) => {
	resolve("成功");
});
// Promise 实例的 then 方法可以接收两个回调函数，分别在未成功时的回调和失败时的回调
p.then(
	val => {
		console.log("成功了调我：" + val); // (此句话将会输出) 成功了调我：成功
	},
	reason => {
		console.log("失败了调我" + reason);
	}
);
```

### 基础版 Promise

由上例可以看出**Promise**是一个构造函数/类，因此可以使用`ES6`的`class`语法进行创建：

```js
// promise 实例的三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
	value; // 成功值
	reason; // 失败原因
	state = PENDING; // 状态
	constructor(executor) {
		// executor 接收两个函数作为参数
		// resolve 函数接收成功值并改变 Promise 实例的状态为 FULFILLED
		const resolve = val => {
			if (this.state === PENDING) {
				this.value = val;
				this.state = FULFILLED;
			}
		};
		// resolve 函数接收失败原因并改变 Promise 实例的状态为 REJECTED
		const reject = reason => {
			if (this.state === PENDING) {
				this.reason = reason;
				this.state = REJECTED;
			}
		};
		// 执行回调函数
		executor(resolve, reject);
	}
	// 根据 state 执行成功回调函数或失败回调函数
	then(onFulfilled, onRejected) {
		if (this.state === FULFILLED) onFulfilled(this.value);
		else if (this.state === REJECTED) onRejected(this.reason);
	}
}

// 测试
const p = new MyPromise((resolve, reject) => {
	// resolve("successful");
	reject("failed");
});
p.then(
	val => console.log(val), // successful
	reason => console.log(reason) // failed
);
```

这样就实现了`then`方法传入的回调函数的执行。但是目前尚只适用同步执行的代码，如果是异步，`then`方法执行回调的时候，**Promise**实例的状态尚未改变。因此需要处理**pending**状态下回调函数的执行问题。

### 解决异步问题

解决思路与`vue`中收集依赖/触发的思想是一致的，在**pending**状态下，将成功回调和失败回调的函数分别收集起来，等到状态改变的时候再去执行相应的回调函数。

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
	value;
	reason;
	state = PENDING;
	onFulfilledCallbacks = []; // 成功回调函数集
	onRejectedCallbacks = []; // 失败回调函数集
	constructor(executor) {
		const resolve = val => {
			if (this.state === PENDING) {
				this.value = val;
				this.state = FULFILLED;
				// 触发依赖
				this.onFulfilledCallbacks.forEach(callback => callback());
			}
		};
		const reject = reason => {
			if (this.state === PENDING) {
				this.reason = reason;
				this.state = REJECTED;
				// 触发依赖
				this.onRejectedCallbacks.forEach(callback => callback());
			}
		};
		executor(resolve, reject);
	}

	then(onFulfilled, onRejected) {
		if (this.state === FULFILLED) onFulfilled(this.value);
		else if (this.state === REJECTED) onRejected(this.reason);
		else {
			// 收集依赖
			// 为啥用数组收集，因为可能存在多个 p.then(callback1, callback2) 的情况
			this.onFulfilledCallbacks.push(() => {
				onFulfilled(this.value);
			});
			this.onRejectedCallbacks.push(() => {
				onRejected(this.reason);
			});
		}
	}
}

const p = new MyPromise((resolve, reject) => {
	setTimeout(() => {
		// resolve("successful");
		reject("failed");
	});
});
p.then(
	val => console.log(val), // successful
	reason => console.log(reason) // failed
);
```

通过收集依赖、触发依赖的方式解决了异步问题，目前还剩最后一个难点，链式调用

### 链式调用

`then`方法应该返回一个新的**Promise**实例，以便实现链式调用

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

/**
 * 决定 then 方法返回的 Promise 的状态及相应的值/原因
 * @param {*} p then 方法返回的 Promise 实例
 * @param {*} x then 方法的回调函数执行结果
 * @param {*} resolve 用来改变 then 方法返回的 Promise 实例的状态为成功
 * @param {*} reject 用来改变 then 方法返回的 Promise 实例的状态为失败
 */
const resolvePromise = (p, x, resolve, reject) => {
	if (p === x) {
		// p 是 then 方法返回的实例，该实例的状态要等待 x 的状态改变才能执行 resolve 或 reject
		// p === x 为真，自己等待自己，是一种错误的实现
		reject(new TypeError("Chaining cycle detected for promise #<Promise>"));
	} else {
		if ((x !== null && typeof x === "object") || typeof x === "function") {
			try {
				let then = x.then;
				// 防止多次调用，因为 then 方法可能存在被其他人改造过的风险（防止一切可能发生的错误）
				// 所以加上该参数来指明 then 方法的回调只调用一个
				let called;
				// 要获取 x 状态改变后的成功值/失败原因，只能在 x 的 then 方法的回调中获取
				if (typeof then === "function") {
					then.call(
						x,
						y => {
							// 成功的回调要再次使用 resolvePromise 是为了防止
							// p.then(val => new Promise((resolve => {
							// 	resolve(new Promise((re, rj) => rj(2)))
							// })))
							if (called) return;
							called = true;
							resolvePromise(p, y, resolve, reject);
						},
						r => {
							// 只要失败了那就失败
							if (called) return;
							called = true;
							reject(r);
						}
					);
				} else {
					resolve(x);
				}
			} catch (e) {
				reject(e);
			}
		} else {
			resolve(x);
		}
	}
};

class MyPromise {
	value;
	reason;
	state = PENDING;
	onFulfilledCallbacks = [];
	onRejectedCallbacks = [];

	constructor(executor) {
		const resolve = val => {
			if (this.state === PENDING) {
				this.value = val;
				this.state = FULFILLED;
				this.onFulfilledCallbacks.forEach(callback => callback());
			}
		};
		const reject = reason => {
			if (this.state === PENDING) {
				this.reason = reason;
				this.state = REJECTED;
				this.onRejectedCallbacks.forEach(callback => callback());
			}
		};
		executor(resolve, reject);
	}

	then(onFulfilled, onRejected) {
		// 在刚开始的时候，一直有一个执念
		// 为啥不在 onFulfilled/onRejected 返回一个 Promise 实例的时候直接执行将那个 Promise 实例返回
		// if/else 一下嘛，但是！它没有执行，哪知道返回的是啥！又不能立即执行，因为 state 状态可能还没变
		// 所以应该返回一个新的 Promise 实例，保证如果onFulfilled/onRejected 返回一个 Promise 实例的时候
		// 它执行 resolve 就 resolve，它执行 reject 就 reject
		const p2 = new Promise((resolve, reject) => {
			// then 方法传入的回调是异步执行的，因此加上 setTimeout
			if (this.state === FULFILLED) {
				setTimeout(() => {
					const x = onFulfilled(this.value);
					// 接下来该用 resolve 还是 reject，需要根据返回值 x 判断，将该部分的逻辑提取到一个函数中以便复用
					resolvePromise(p2, x, resolve, reject);
				});
			} else if (this.state === REJECTED) {
				setTimeout(() => {
					const x = onRejected(this.reason);
					resolvePromise(p2, x, resolve, reject);
				});
			} else {
				this.onFulfilledCallbacks.push(() => {
					setTimeout(() => {
						const x = onFulfilled(this.value);
						resolvePromise(p2, x, resolve, reject);
					});
				});
				this.onRejectedCallbacks.push(() => {
					setTimeout(() => {
						const x = onRejected(this.reason);
						resolvePromise(p2, x, resolve, reject);
					});
				});
			}
		});
		return p2;
	}
}

// 测试
const p = new MyPromise((resolve, reject) => {
	setTimeout(() => {
		resolve("successful");
		// reject("failed");
	});
});
p.then(
	val => {
		return new MyPromise(resolve => {
			resolve(val + " again");
		});
	},
	reason => {
		return reason + " again";
	}
).then(
	val => console.log(val), // successful again
	reason => console.log(reason) // failed again
);
```

## async/await

首先回顾一下 async/await 的相关代码：

```js
async function f() {
	const a = await new Promise(resolve =>
		setTimeout(resolve("async/await"), 1000)
	);
	console.log(a);
	const b = await "hahaha";
	console.log(b);
}
f(); // async/await  hahaha
```

**await**可以等待一个**Promise**实例的状态改变之后再进行执行接下来的同步代码。在 ES6 中，有一个生成器函数，其搭配的关键词**yield**就可以让代码暂停执行，什么时候想执行了，再调用**next()**方法执行后续的代码，上面的异步函数转换成生成器函数的形式如下：

```js
function* gen() {
	const a = yield new Promise(resolve =>
		setTimeout(resolve("async/await"), 1000)
	);
	console.log(a);
	const b = yield "hahaha";
	console.log(b);
}

// 手动执行
const iter = gen();
// yield 可以作为函数的中间返回语句使用，返回值 item 如下
const item = iter.next();
console.log(item); // { value: Promise { 'async/await' }, done: false }
// 上述函数中变量 a 需要的值就在 item.value 中，可以用 Promise.prototype.then 方法取出来
item.value.then(val => {
	// yield 还可以作为函数的中间参数使用
	// 上一次让函数暂停的 yield 关键字会接收到传给 next 方法的第一个值
	const item2 = iter.next(val); // async/await 赋值给了 yield，此时 a 就等于 async/await 字符串了
	console.log(item2); // { value: 'hahaha', done: false }
	// item2.value 不是 Promise 实例
	iter.next(item2.value); // 此时 b 也成功赋值为 hahaha
});
```

已经实现了手动执行生成器函数，达到了“异步” --> “同步”的效果，因此只需要封装成一个自动依序执行的函数即可：

```js
function* gen() {
	const a = yield new Promise(resolve =>
		setTimeout(resolve("async/await"), 1000)
	);
	console.log(a);
	const b = yield "hahaha";
	console.log(b);
	return 555;
}

// 自动执行
function execGenToPromise(gen) {
	// 每个异步函数的返回值必须是 Promise 的实例
	return new Promise((resolve, reject) => {
		const iter = gen();
		/**
		 * 依据 yield 关键字按序执行
		 * @param {*} arg 给 yield 关键词赋的值
		 */
		function step(arg) {
			try {
				const { value, done } = iter.next(arg);
				if (!done) {
					// value 也可能不是 Promise 实例
					value instanceof Promise
						? value.then(v => {
								step(v);
						  })
						: step(value);
				} else {
					// 结束  返回成功值
					resolve(value);
				}
			} catch (error) {
				reject(error);
			}
		}
		step();
	});
}

// 测试 execGenToPromise 函数
async function test() {
	const res = await execGenToPromise(gen);
	console.log(res);
}

test(); // 依次输出  async/await  hahaha  555
```
