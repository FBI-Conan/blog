module.exports = {
	title: "个人博客",
	description: "前湖小仙的个人博客",
	port: "7777",
	host: "localhost",
	markdown: {
		lineNumbers: true,
	},
	themeConfig: {
		logo: "/assets/img/headphoto.png",
		logoDark: "/assets/img/headphoto.png", // 夜间模式下使用的logo
		navbar: [
			{
				text: "生涯",
				children: [
					{ text: "回首", link: "/guide/eassays/" },
					{ text: "眺望", link: "/guide/diary/" },
				],
			},
			{
				text: "日记",
				link: "/guide/diary/",
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
				text: "vue的学习",
				link: "/studySituation/vue/",
			},
		],
		repo: "FBI-Conan/blog",
		sidebar: {
			"/guide": [
				{
					text: "日记",
					link: "/guide/diary/",
				},
				{
					text: "前端",
					link: "/guide/eassays/",
				},
			],
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
		},
		sidebarDepth: 2,
		editLink: false,
	},
	plugins: [["@vuepress/plugin-search"]],
};
