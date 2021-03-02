module.exports = {
    title: 'Flutter技术平台',
    description: 'Flutter技术平台',
    head: [ // 注入到当前页面的 HTML <head> 中的标签
        ['link', {
            rel: 'icon',
            href: '/logo.jpg'
        }], // 增加一个自定义的 favicon(网页标签的图标)
    ],
    base: '/', // 这是部署到github相关的配置
    markdown: {
        lineNumbers: true
    },    
    themeConfig: {
        nav: [ // 导航栏配置
            {
                text: '源码',
                link: 'https://gitlab.liebaopay.com/cf_public_flutter'
            },
            {
                text: '构建',
                link: 'http://build.zhhainiao.com'
            },
            {
                text: 'pub',
                link: 'http://pub.zhhainiao.com'
            }
        ],
        sidebar: {
            '/': [
                "/", //指的是根目录的md文件 也就是 README.md 里面的内容
                "document_android", //接入文档
                "document_ios", //接入文档
                "download", //sdk下载
                "changelog",//更新日志
            ]
        },
        sidebarDepth: 1, // 侧边栏显示2级
    }
}