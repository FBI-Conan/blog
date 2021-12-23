# 项目目录
1. node_modules

项目的依赖包文件夹

2. public

放置项目的静态资源，该文件夹中的静态资源是不会被`webpack`去打包的，只是简单的复制。需要通过**绝对路径**去引用它们。

我们推荐将资源作为模块依赖图的一部分导入（静态资源推荐放到`src/assets`中），这样就会通过`webpack`去打包处理。

::: tip 何时使用 public 文件夹

- 你需要在构建输出中指定一个文件的名字。
- 你有上千个图片，需要动态引用它们的路径。
- 有些库可能和 webpack 不兼容，这时你除了将其用一个独立的`<script>`标签引入没有别的选择。

:::

[参考 Vue Cli](https://cli.vuejs.org/zh/guide/html-and-static-assets.html#url-%E8%BD%AC%E6%8D%A2%E8%A7%84%E5%88%99)

3. src

- **Assets**

  静态文件目录

- **Components**

  公用组件目录（经常复用的组件可以放置于此）

- **Views**

  页面组件

- **http**

  放置与后台 api 相关的文件

4. package.json

- dependencies

  生产版本需要的依赖

- devDependencies

  开发版本需要的依赖，线上生产环境不需要它们。区别开发依赖的目的是减少在安装依赖时 node_modules 的体积，提升安装依赖的速度，且节省资源。

::: tip 哪些可以划分为开发依赖

- 构建工具：
  `webpack webpack-cli roolup(尚未使用过)`等。构建工具的目的是生成生产版本的代码，因此生成完成后自然不需要这些依赖了。

- 预处理器： `less-loader babel-loader typescript`等。它们的任务是生成`css`文件、高阶语法转换及其他、生成`js`文件等，转换完成后能够在生产版本正常运行展示即可。

- 测试用具：`jest chai e2e(后两样尚未用过)`等。生产版本自然是不需要测试的。

- 其他：如`webpack-dev-server`只在开发版本时需要使用的，或者因为其他原因（像性能问题）不能在生产版本使用的。

:::
