# 虚拟 Dom

[虚拟 DOM 是轻量级的 JavaScript 对象，由渲染函数创建。](https://v3.cn.vuejs.org/guide/optimizations.html#%E8%99%9A%E6%8B%9F-dom)。

## h 函数

生成虚拟 Dom 使用的即是 h 函数，h 函数很简单，如下：

```js
/**
 * 渲染函数（h 函数）
 * @param tag 元素标签
 * @param props 属性对象
 * @param children 子级
 */
function h(tag, props, children) {
	return {
		tag,
		props,
		children,
	};
}
```

## mount 函数

接下来将生成的虚拟 Dom 挂载到某一容器上面：

```js
/**
 * 通过虚拟 Dom 创建真实 Dom
 * @param vnode 虚拟dom/节点
 */
function createDom(vnode) {
	const el = (vnode.el = document.createElement(vnode.tag));
	// props
	for (const key in vnode.props) {
		const value = vnode.props[key];
		el.setAttribute(key, value);
	}
	// children （支持 string 和 array 两种形式）
	if (vnode.children) {
		if (typeof vnode.children === "string") {
			el.textContent = vnode.children;
		} else {
			vnode.children.forEach(child => el.append(createDom(child)));
		}
	}
	return el;
}

// 挂载
function mount(vnode, container) {
	container.append(createDom(vnode));
}
```

测试一下效果：

```html
<style>
	.red {
		color: red;
	}
</style>

<div id="app"></div>

<script>
	// ... h mount
	mount(
		h("div", { class: "red" }, [h("span", null, "hello")]),
		document.getElementById("app")
	); // 成功在页面上渲染出红色的 hello 字样
</script>
```

## patch 函数

当虚拟 Dom 更新之后，暴力强拆之前的所有 Dom 节点进行重新渲染是不可取的，因此需要 diff 新旧虚拟 Dom 进行最小化更新，这其中就牵扯到虚拟 Dom 的最核心部分 diff 算法。

```js
/**
 * 比较新旧虚拟 dom 进行补丁更新
 * @param n1 旧虚拟 dom
 * @param n2 新虚拟 dom
 */
function patch(n1, n2) {
	if (n1.tag === n2.tag) {
		const el = (n2.el = n1.el);
		// props
		const oldProps = n1.props || {};
		const newProps = n2.props || {};
		const allProps = { ...oldProps, ...newProps };
		for (const key in allProps) {
			const oldPropsVal = oldProps[key];
			const newPropsVal = newProps[key];
			if (newPropsVal !== oldPropsVal) {
				/**
				 * 1. key 新增(in newProps  notIn oldProps)
				 * 2. key 消失(in oldProps  notIn newProps)
				 * 3. key 修改(in newProps and oldProps)
				 * 1和3 可以直接覆盖即setAttribute   2 应该 removeAttribute
				 */
				if (key in newProps) {
					el.setAttribute(key, newPropsVal);
				} else {
					el.removeAttribute(key);
				}
			}
		}
		// children
		const oldChildren = n1.children;
		const newChildren = n2.children;
		if (typeof newChildren === "string") {
			if (oldChildren !== newChildren) {
				el.innerHTML = newChildren;
			}
		} else {
			if (typeof oldChildren === "string") {
				el.innerHTML = "";
				oldChildren.forEach(child => mount(child, el));
			} else {
				// 两者都有子节点数组 (diff 算法的核心)
				// 来点简单的实现方式，(同位对比，不考虑 key 值，强制对比更新)
				const commonLength = Math.min(oldChildren.length, newChildren.length);
				for (let index = 0; index < commonLength; index++) {
					const oldChild = oldChildren[index];
					const newChild = newChildren[index];
					patch(oldChild, newChild);
				}
				if (newChildren.length > oldChildren.length) {
					for (let index = commonLength; index < newChildren.length; index++) {
						const child = newChildren[index];
						mount(child, el);
					}
				}
				if (newChildren.length < oldChildren.length) {
					for (let index = commonLength; index < oldChildren.length; index++) {
						const child = oldChildren[index];
						el.removeChild(child.el);
					}
				}
			}
		}
	} else {
		// replace
		const el = n1.el;
		el.parentNode.replaceChild(createDom(n2), el);
	}
}
```

测试一下：

```html
<style>
	.red {
		color: red;
	}
	.green {
		color: green;
	}
</style>

<div id="app"></div>

<script>
	// ... h mount patch
	const vdom = h("div", { class: "red" }, [h("span", null, "hello")]);
	const vdom2 = h("div", { class: "green" }, "world");
	mount(vdom, document.getElementById("app"));

	patch(vdom, vdom2); // 页面出现绿色的 world 字样
</script>
```

## mini-vue

响应式（reactivity）和虚拟 Dom 之间会有配合实现页面的响应式更新：

```html
<div id="app"></div>
<button>add</button>

<script type="module">
	// 引用之前的 reactivity 中的 effect 和 reactive 函数
	import { effect } from "./effect.js";
	import { reactive } from "./reactive.js";
	// ... h mount patch

	// 定义组件
	const App = {
		data: reactive({
			count: 0,
		}),
		render() {
			return h("div", null, String(this.data.count)); // 将 count 转换为字符串是因为之前只做了 string 类型的判断
		},
	};

	// 挂载组件
	function mountApp(component, container) {
		let isMounted = false;
		let preVdom;
		// 将整个组件作为依赖以实现响应式的页面内容更新
		effect(() => {
			if (!isMounted) {
				// mount
				preVdom = component.render();
				mount(preVdom, container);
				isMounted = true;
			} else {
				// patch
				const curVdom = component.render();
				patch(preVdom, curVdom);
				preVdom = curVdom;
			}
		});
	}

	mountApp(App, document.getElementById("app"));

	// 测试
	const btn = document.querySelector("button");
	btn.onclick = () => {
		App.data.count++;
	}; // 点击 add 按钮改变响应式数据 count，触发依赖更新，执行 diff（patch函数），更新页面
</script>
```

至此利用手写的[reactivity](/studySituation/vue/coreReactivity.html)和[vdom](/studySituation/vue/coreVdom.html)就实现了一个很简单的 vue “框架”(bushi)，现在只支持用 render 函数去写界面，如果要支持 template 的话，就是 vue 的另一个核心模块**模板编译**的内容了。
