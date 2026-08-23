# 印象蔡村 · 山青水秀月亮湾

安徽省宣城市泾县蔡村镇文旅数字展示网站 · [在线预览](https://zhoujunhao123456.github.io/caicun-2026/)

国家 AAA 级月亮湾景区、龙映山、皖南川藏线、千年宣纸非遗、红色记忆、爱民翠尖茶与“华夏毛竹第一镇”——一页看尽泾县蔡村。

## ✨ 功能特性

- **宣纸水墨视觉风格**：书法字体、墨点光标、宣纸颗粒纹理、印章元素，全站单页沉浸式滚动
- **首屏书法字加载动画**：墨滴晕染揭幕 + 预加载百分比计数，支持无 JS / 无动画库优雅降级
- **横向长卷"景点巡礼"**：桌面端 ScrollTrigger 横向滚动卷轴，四景（月亮湾 / 龙映山 / 皖南川藏线 / 影视取景地）依次展开
- **数字增长动画**：蔡村名片（面积 / 民宿 / 森林覆盖率等）与茶竹风物数据滚动增长
- **光影图集**：45 帧实拍影像瀑布流，灯箱放大查看（含键盘方向键切换、Tab 焦点陷阱、Esc 关闭）
- **移动端全屏菜单**：墨圈展开动画、焦点管理、矮屏可滚动
- **游玩攻略**：何时来 / 怎么来 / 怎么玩，三卡一览
- **可访问性**：跳过链接、ARIA 语义、键盘导航、`prefers-reduced-motion` 降级
- **境内网络友好**：GSAP / ScrollTrigger / Lenis 自托管，Google Fonts 异步加载 + 系统中文字体回退

## 🛠 技术栈

- 原生 HTML / CSS / JavaScript（无构建步骤）
- [GSAP 3](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/)：滚动动效与横向卷轴
- [Lenis](https://github.com/darkroomengineering/lenis)：平滑滚动
- [GitHub Pages](https://pages.github.com/)：托管部署

依赖已自托管至 [`assets/vendor/`](assets/vendor/)，不依赖境外 CDN。

## 🚀 本地预览

```bash
# 在 site/ 目录下启动静态服务器
npx http-server . -p 8619
# 浏览器打开 http://127.0.0.1:8619/
```

## 📦 部署

仓库通过 GitHub Pages 自动部署到 `main` 分支（无需构建步骤，已含 `.nojekyll`）：

```bash
git add -A
git commit -m "更新内容"
git push origin main
```

约 1 分钟内线上站点自动更新。

## 📁 目录结构

```
site/
├── index.html               # 单页站点（SEO / OG / JSON-LD 已配置）
├── assets/
│   ├── css/style.css        # 宣纸水墨风样式
│   ├── js/main.js           # 交互脚本（动效 / 灯箱 / 菜单 / 降级逻辑）
│   ├── vendor/              # 自托管的 GSAP / ScrollTrigger / Lenis
│   └── img/                 # 实拍影像（webp，按场景分目录）
└── README.md
```

## 📝 制作

由合肥工业大学宣城校区计算机与信息系 **“月湾竹韵 · 智绘蔡村”暑期“三下乡”社会实践团队**制作，素材为实地拍摄。
