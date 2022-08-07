# API

访问 API 的 3 种方式(3 种方式的概念和参数基本相同)：

- **命令行**

  `--foo` 用于启用布尔标志，如 `--minify`，`--foo=bar` 用于单个值和只指定一次的标志，如 `--platform=`，`--foo:bar` 用于有多个值和可以重复指定多次的标识，如 `--external:`

- **JS**

  [基于 node 的 JS API 有同步和异步两种风格](https://esbuild.github.io/api/#js-specific-details)。

  1. 同步 API

  ```js
  let esbuild = require('esbuild');
  let result1 = esbuild.transformSync(code, options);
  let result2 = esbuild.buildSync(options);
  ```

  _优点：_

  - 无需使用 Promise 代码更简洁
  - 适用于必须同步的情况 `require.extensions`

  _缺点：_

  - 不能将插件与同步 API 一起使用，因为插件是异步的
  - 阻塞当前线程，不能同步执行其它工作
  - 同步 API 会阻止 esbuild 并行调用 esbuild API

  2. 异步 API

  ```js
  let esbuild = require  ('esbuild')
  esbuild.transform(code,   options).then(result =>   { ... })
  esbuild.build(options).then  (result => { ... })
  ```

  _优点：_

  - 可以使用插件
  - 不会阻塞线程，所以可以同时执行其它工作
  - 可以同时运行多个 API 的调用，然后将这些调用分布在所有可用的 CPU 上以获得最佳性能

  _缺点：_

  - 代码更混乱，尤其在 CJS 中顶级 await 不可用
  - 在必须同步的情况下不能工作，如`require.extensions`

- **Go**

## transform API

调用 transform API 对单个字符串进行操作，而无需访问文件系统。这使得它非常适合在没有文件系统（如浏览器）的环境中使用，或作为另一个工具链的一部分使用。

:::: code-group
::: code-group-item 命令行

```shell
echo 'let x: number = 1' | esbuild --loader=ts
# let x = 1;
```

:::
::: code-group-item JS

```js
require('esbuild').transformSync('let x: number = 1', {
	loader: 'ts',
});
// {
//   code: 'let x = 1;\n',
//   map: '',
//   warnings: []
// }
```

:::
::: code-group-item Go

```go
package main

import "fmt"
import "github.com/evanw/esbuild/pkg/api"

func main() {
  result := api.Transform("let x: number = 1", api.TransformOptions{
    Loader: api.LoaderTS,
  })

  if len(result.Errors) == 0 {
    fmt.Printf("%s", result.Code)
  }
}
```

:::
::::

使用场景：未提供输入文件且 `--bundle` 标志不存在。其选项包括

- define
- format
- loader
- minify
- platform 等等[](https://esbuild.github.io/api/#transform-api)。

## build API

build API 对文件系统的一个或多个文件进行操作，这允许文件之间相互引用并被打包在一起。

:::: code-group
::: code-group-item 命令行

```shell
echo 'let x: number = 1' > in.ts
esbuild in.ts --outfile=out.js
cat out.js
# let x = 1;
```

:::
::: code-group-item JS

```js
require('fs').writeFileSync('in.ts', 'let x: number = 1');
require('esbuild').buildSync({
	entryPoints: ['in.ts'],
	outfile: 'out.js',
});
// { errors: [], warnings: [] }
require('fs').readFileSync('out.js', 'utf8');
// 'let x = 1;\n'
```

:::
::: code-group-item Go

```go
package main

import "io/ioutil"
import "github.com/evanw/esbuild/pkg/api"
import "os"

func main() {
  ioutil.WriteFile("in.ts", []byte("let x: number = 1"), 0644)

  result := api.Build(api.BuildOptions{
    EntryPoints: []string{"in.ts"},
    Outfile:     "out.js",
    Write:       true,
  })

  if len(result.Errors) > 0 {
    os.Exit(1)
  }
}
```

:::
::::

使用场景：提供至少一个输入文件或存在 `--bundle` 标志，esbuild 默认不打包，必须显示的指定 `--bundle` 标志才会打包，如果没有提供输入文件则会从 `stdin(标准输入)` 读取一个单输入文件。其选项包括

- bundle
- define
- entryPoints
- format
- inject
- loader
- minify
- outdir
- outfile 等等[](https://esbuild.github.io/api/#build-api)
