module.exports = {
	title: "个人博客",
	description: "前湖小仙的个人博客",
	port: "7777",
	host: "localhost",
	markdown: {
		code: {
			lineNumbers: true,
		}
	},
	themeConfig: {
		logo: "/assets/img/headphoto.png",
		logoDark: "/assets/img/headphoto.png", // 夜间模式下使用的logo
		navbar: [
			{
				text: "目录",
				link: "/guide/catlog",
			},
			{
				text: "语言",
				children: [
					{
						text: "TypeScript",
						link: "/studySituation/ts/",
					},
					{
						text: "JavaScript",
						link: "/studySituation/js/",
					},
				],
			},
			{
				text: "前端框架",
				children: [{ text: "Vue", link: "/studySituation/vue/" }],
			},
			{
				text: "后端",
				children: [
					{ text: "Node.js", link: "/studySituation/backEnd/nodejs/" },
				],
			},
			{
				text: "工具",
				children: [{ text: "测试", link: "/studySituation/codeTest/" }],
			},
			{
				text: "小游戏",
				link: "http://game.fbiconan.xyz",
			},
		],
		repo: "FBI-Conan/blog",
		sidebar: {
			"/guide": ["/guide/catlog/README.md", "/guide/plan/README.md"],
			"/studySituation/vue": [
				{
					text: "Vue",
					children: [
						"/studySituation/vue/",
						"/studySituation/vue/directory.md",
						"/studySituation/vue/lifeCycle.md",
						"/studySituation/vue/compositionAPI.md",
						"/studySituation/vue/plugin.md",
						"/studySituation/vue/coreReactivity.md",
						"/studySituation/vue/coreVdom.md",
					],
				},
			],
			"/studySituation/ts": [
				"/studySituation/ts/README.md",
				"/studySituation/ts/type.md",
				"/studySituation/ts/configfile.md",
				"/studySituation/ts/clazz.md",
				"/studySituation/ts/interface.md",
				"/studySituation/ts/generics.md",
				"/studySituation/ts/expect.md",
			],
			"/studySituation/js": [
				"/studySituation/js/",
				"/studySituation/js/handwritten.md",
			],
			"/studySituation/codeTest": [
				"/studySituation/codeTest/",
				{
					text: "Jest",
					children: [
						"/studySituation/codeTest/jest/firstLook.md",
						"/studySituation/codeTest/jest/componentTest.md",
					],
				},
			],
			"/studySituation/backEnd/nodejs": [
				"/studySituation/backEnd/nodejs/",
				"/studySituation/backEnd/nodejs/fs.md",
				"/studySituation/backEnd/nodejs/path.md",
				"/studySituation/backEnd/nodejs/http.md",
				"/studySituation/backEnd/nodejs/modularization.md",
				"/studySituation/backEnd/nodejs/express.md",
			],
		},
		sidebarDepth: 2,
		editLink: false,
	},
	plugins: [["@vuepress/plugin-search"]],
};
