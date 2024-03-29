const { searchPlugin } = require('@vuepress/plugin-search');
import { defineUserConfig, defaultTheme } from 'vuepress';
import { viteBundler } from '@vuepress/bundler-vite';
import { registerComponentsPlugin } from '@vuepress/plugin-register-components';
import path from 'path';

module.exports = defineUserConfig({
	title: '个人博客',
	description: '前湖小仙的个人博客',
	port: 7777,
	host: 'localhost',
	markdown: {
		code: {
			lineNumbers: true,
		},
	},
	theme: defaultTheme({
		logo: '/assets/img/headphoto.png',
		logoDark: '/assets/img/headphoto.png', // 夜间模式下使用的logo
		navbar: [
			{
				text: '目录',
				link: '/guide/catlog',
			},
			{
				text: '语言',
				children: [
					{
						text: 'TypeScript',
						link: '/studySituation/ts/',
					},
					{
						text: 'JavaScript',
						link: '/studySituation/js/',
					},
					{
						text: 'Css',
						link: '/studySituation/css/layout/flex.md'
					}
				],
			},
			{
				text: '前端',
				children: [
					{ text: 'Vue', link: '/studySituation/vue/' },
					{
						text: '微前端',
						link: '/studySituation/microFrontends/',
					},
					{
						text: 'web开发技术',
						link: '/studySituation/webDevelopTech/webComponent/',
					},
				],
			},
			{
				text: '后端',
				children: [
					{ text: 'Node.js', link: '/studySituation/backEnd/nodejs/' },
					{ text: 'MySQL', link: '/studySituation/backEnd/mySQL/' },
					{ text: '认证', link: '/studySituation/backEnd/authentication/' },
				],
			},
			{
				text: '工具',
				children: [
					{ text: '测试', link: '/studySituation/codeTest/' },
					{
						text: '打包构建',
						link: '/studySituation/build/webpack/concepts.md',
					},
				],
			},
			{
				text: '小游戏',
				link: 'http://game.fbiconan.xyz',
			},
		],
		repo: 'FBI-Conan/blog',
		sidebar: {
			'/guide': ['/guide/catlog/README.md', '/guide/plan/README.md'],
			'/studySituation/vue': [
				'/studySituation/vue/',
				'/studySituation/vue/directory.md',
				'/studySituation/vue/lifeCycle.md',
				'/studySituation/vue/compositionAPI.md',
				'/studySituation/vue/plugin.md',
				'/studySituation/vue/coreReactivity.md',
				'/studySituation/vue/coreVdom.md',
			],
			'/studySituation/ts': [
				'/studySituation/ts/README.md',
				'/studySituation/ts/type.md',
				'/studySituation/ts/configfile.md',
				'/studySituation/ts/clazz.md',
				'/studySituation/ts/interface.md',
				'/studySituation/ts/generics.md',
				'/studySituation/ts/function.md',
				'/studySituation/ts/object.md',
				'/studySituation/ts/createTypeByType.md',
				'/studySituation/ts/utilityType.md',
				'/studySituation/ts/expect.md',
			],
			'/studySituation/js': [
				'/studySituation/js/',
				'/studySituation/js/handwritten.md',
			],
			'/studySituation/codeTest': [
				'/studySituation/codeTest/',
				{
					text: 'Jest',
					children: [
						'/studySituation/codeTest/jest/firstLook.md',
						'/studySituation/codeTest/jest/componentTest.md',
					],
				},
			],
			'/studySituation/backEnd/nodejs': [
				'/studySituation/backEnd/nodejs/',
				'/studySituation/backEnd/nodejs/fs.md',
				'/studySituation/backEnd/nodejs/path.md',
				'/studySituation/backEnd/nodejs/http.md',
				'/studySituation/backEnd/nodejs/modularization.md',
				'/studySituation/backEnd/nodejs/express.md',
				'/studySituation/backEnd/nodejs/expressSession.md',
				'/studySituation/backEnd/nodejs/jsonwebtoken.md',
				'/studySituation/backEnd/nodejs/expressJwt.md',
			],
			'/studySituation/backEnd/mySQL': [
				'/studySituation/backEnd/mySQL/',
				'/studySituation/backEnd/mySQL/sql.md',
				'/studySituation/backEnd/mySQL/mysqlModule.md',
			],
			'/studySituation/backEnd/authentication': [
				'/studySituation/backEnd/authentication/',
				'/studySituation/backEnd/authentication/cookie.md',
				'/studySituation/backEnd/authentication/session.md',
				'/studySituation/backEnd/authentication/token.md',
			],
			'/studySituation/microFrontends': [
				'/studySituation/microFrontends/',
				'/studySituation/microFrontends/singleSpa.md',
				'/studySituation/microFrontends/qiankun.md',
			],
			'/studySituation/webDevelopTech': [
				{
					text: 'web component',
					collapsible: true,
					children: [
						'/studySituation/webDevelopTech/webComponent/',
						'/studySituation/webDevelopTech/webComponent/customElements.md',
						'/studySituation/webDevelopTech/webComponent/shadowDom.md',
						'/studySituation/webDevelopTech/webComponent/htmlTemplate.md',
					],
				},
				{
					text: 'canvas',
					collapsible: true,
					children: [
						'/studySituation/webDevelopTech/canvas/',
						'/studySituation/webDevelopTech/canvas/example.md',
					],
				},
				{
					text: 'web Api',
					collapsible: true,
					children: ['/studySituation/webDevelopTech/webApi/'],
				},
				{
					text: 'axios',
					collapsible: true,
					children: ['/studySituation/webDevelopTech/axios/'],
				},
			],
			'/studySituation/build': [
				{
					text: 'webpack',
					collapsible: true,
					children: [
						'/studySituation/build/webpack/concepts.md',
						'/studySituation/build/webpack/loader.md',
						'/studySituation/build/webpack/plugin.md',
					],
				},
				{
					text: 'esbuild',
					collapsible: true,
					children: [
						'/studySituation/build/esbuild/start.md',
						'/studySituation/build/esbuild/api.md',
					],
				},
				{
					text: 'vite 工具链方案',
					collapsible: true,
					children: ['/studySituation/build/vite/introduction.md'],
				},
			],
			'/studySituation/css': [
				{
					text: 'css 布局',
					collapsible: true,
					children: [
						'/studySituation/css/layout/flex.md',
					],
				},
			],
		},
		sidebarDepth: 2,
		editLink: false,
	}),
	plugins: [
		[searchPlugin({})],
		[
			registerComponentsPlugin({
				componentsDir: path.resolve(__dirname, 'components'), // 注册 Vue 组件
			}),
		],
	],
	bundler: viteBundler({
		vuePluginOptions: {
			template: {
				// 解决 vuepress 将 font 和 center 等非标准的 HTML 标签解析为 Vue 组件的问题
				compilerOptions: {
					isCustomElement: tag => ['center', 'font'].includes(tag),
				},
			},
		},
	}),
});
