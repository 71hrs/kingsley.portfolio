# Portfolio 三个核心页面重建交接文档

## 1. 文档目的

这份文档是 Home、Works、About 三个核心页面的统一交接规范。Highlights 的内容已经并入 About；旧的 Highlights 路径仅作为兼容入口。后续继续开发、修 bug 或交接给其他人时，以本文件为准。

目标是用一套干净、可维护的新代码，复现原网站已经确认的最终视觉和交互效果。新代码可以重新组织，但最终呈现不能改变。

## 2. 页面范围

三个核心页面如下：

- Website Pages/index.html：Home 首页。Home 不另建 home.html，index.html 就是 Home。
- Website Pages/works.html：Works 页面。
- Website Pages/about.html：About 页面，包含原 Highlights 的内容。

导航必须在这三个页面之间使用站内相对链接，不能混入旧的 file 路径、临时 localhost 路径或生产域名路径。旧的 `/highlights` 路径只保留到 About 的兼容映射。

## 3. 重建原则

### 3.1 新代码与旧代码分离

- 原有页面可保存在 backup 中，作为视觉、内容和交互的参考。
- backup 只用于核对和恢复内容，不复制旧的 class、旧的 DOM 结构或旧的覆盖式修补代码。
- 新页面从干净的 HTML、CSS、JavaScript 结构开始。
- 新页面不能依赖 backup 文件才能正常运行。
- 不使用逐次叠加的补丁修复。发现问题时，先找出负责该效果的源规则，再直接修正源规则，并删除失效规则。

### 3.2 保持最终呈现

重建不能造成重新设计。必须保留原页面已经确定的：

- 页面布局、栏宽、对齐方式和间距；
- 字体、字重、字号、行高和换行逻辑；
- 颜色、背景 shader、渐变或原有动效；
- logo、favicon、图片和视频的显示方式；
- hover、focus、点击、弹窗、页面进场和离场效果；
- 桌面、iPad 和手机尺寸下的响应式行为。

Refik Anadol / Tomorrowland 等参考页面只用于确认版式节奏和响应式方法；实际页面仍以本项目 backup 中的最终效果为准。

### 3.3 源头优先与页面边界

- 先判断问题属于三页共有层，还是某一页独有的布局、视觉或交互；页面独有问题只在该页自己的 HTML、CSS 或 JavaScript 中修正。
- 不为了快速覆盖现象而继续添加补丁式覆盖规则、同义选择器、重复 DOM、`!important` 或第二套相同功能。
- 发现错位、裁切、层级或动效问题时，先找到产生该现象的源规则并直接修改或删除；修改共享层必须确认该规则确实被多个页面共同使用，不能把单页例外带入 `main.css` 或 `main.js`。
- 需要覆盖整个 viewport 的固定遮罩或交互层，不能放在会创建 fixed containing block 的祖先（例如 `transform`、`filter`、`contain` 或 `will-change`）内部；如果页面进场动画只创建层叠上下文，则遮罩和当前活动内容必须放在同一页面层，并明确验证滚动前后的固定位置和层级。
- 页面进场动画不能为了复用而直接施加在包含固定遮罩或 backdrop-filter 的根内容容器上；如果根容器产生 `transform` 合成层，必须把动画移动到不会改变定位/采样上下文的页面内容子层，并让根容器保持 `transform: none`。
- 卡片局部毛玻璃与整页变暗遮罩必须是两个独立效果：卡片自己的伪元素负责 `backdrop-filter`，整页遮罩只负责半透明变暗，不得把页面背景 blur 误加到遮罩上。当前活动卡片必须通过明确的层级高于遮罩，不能靠降低遮罩透明度来掩盖层级错误。
- 使用 `backdrop-filter` 的页面卡片不要随意增加 `isolation: isolate` 或其他会切断 backdrop 采样的隔离层；遇到“属性存在但视觉没有 blur”时，先排查祖先的 `transform`、`filter`、`contain`、`will-change` 和隔离上下文，再修改页面独有源规则。
- Works 的页面根内容不能用 `z-index` 创建包住全部项目的整体层叠上下文；必须让共享 header、全视口 scrim 和当前活动卡片分别参与页面层级，这样 header 才能处于 scrim 下方、普通项目内容上方，而活动卡片处于最上方。
- 每次修复后清理已经失效的旧规则，并用实际页面和三种屏幕尺寸重新验证，避免把临时修复留成后续维护隐患。

## 4. 文件组织和代码边界

### 4.1 共享层

三个页面共同使用的结构集中管理：

- 一个共享样式文件：main.css；
- 一个共享脚本文件：main.js。

共享层应包括：

- 全局 reset、基础盒模型和字体加载；
- logo、页面 header 和导航基础结构；
- 桌面导航链接和统一 hover；
- 手机端圆形 hamburger 按钮；
- hamburger 展开面板、点击空白处关闭和键盘可访问性；
- 三页统一的进场/离场过渡；
- 背景 shader 或统一背景动画；
- 共享的颜色变量、排版变量、间距变量；
- 共享的断点与 header 对齐规则；
- 不属于某一页的基础滚动行为。

共享 CSS 只能放真正被多个页面复用的规则。不要把 Home 或 Works 的独有布局塞进 main.css。

### 4.2 页面独有层

某页独有的内容和交互，放在对应页面自己的文件中。每个页面最多保留一份自己的 CSS 和一份自己的 JavaScript：

- Home：首页个人介绍、Selected Work 卡片、卡片 hover/弹窗、社交链接 hover；
- Works：作品 gallery、分类标题、作品卡片排列和 Works 独有 hover；
- About：Biography、Education、Experience，以及原 Highlights 的 Awards、Exhibitions、Press、Events、Jury 内容。

页面独有文件只写该页特有的颜色、特殊布局或特殊交互。相同语义的结构必须使用相同的共享 class，不得为同一种结构创建多个名字。

### 4.3 不再保留的重叠层

三个核心页面不应再依赖或新增以下类型的重复共享文件：

- 多份互相覆盖的 portfolio/page CSS；
- 多份 Brand、Mobile Navigation、Portfolio Pages 等重复样式；
- js/shared 或其他无法说明归属的脚本目录；
- 只为覆盖旧规则而存在的临时 CSS；
- 同一功能的多个 JavaScript 实现。

如果旧文件已无引用，先用全文检索确认，再删除；删除后再检查浏览器 Network 和控制台是否有 404。

## 5. Class 命名规范

### 5.1 共享 class

共享结构使用稳定、语义化的名称，例如：

- site-header
- site-brand
- site-navigation
- site-menu-button
- site-menu-panel
- site-page-transition

名称应描述职责，而不是描述当前颜色或视觉状态。

### 5.2 页面 class

页面特有 class 使用页面前缀，避免互相污染，例如：

- home-intro、home-selected-work、home-project-card；
- works-gallery、works-category、works-card；
- about-content、about-section。

同一职责在所有页面出现时，使用同一个共享 class；不要因为某个页面暂时出现错位而另建第二套同义 class。

### 5.3 状态 class

状态使用统一形式，例如 is-open、is-active、is-hovered。状态由 JavaScript 控制，不能用重复 DOM 或重复文字制造视觉状态。

## 6. 字体和资源

- 只加载仓库中已有的本地字体文件。
- 不引用 Google Fonts 或其他远程字体 source。
- Home 和 About 底部四个社交图标沿用 Backup 的 Font Awesome 图标类名和 glyph，但字体文件改为项目内 Assets/font/fa-brands-400.woff2、Assets/font/fa-solid-900.woff2 自托管；页面不依赖远程字体 CDN。
- 字体文件应放在项目自己的 Assets 目录中，并由 main.css 的 @font-face 统一声明。
- 正文、标题、导航、quotation 和按钮分别使用明确的字体 token；相同语义必须保持相同字号、字重和行高。
- Works 四个分类标题可以共享 Works 分类标题这一类声明，但必须与 quotation、项目标题保持独立；项目标题使用自己的 selector，避免后续单独换字时互相牵连。
- logo、favicon、图片和视频使用本地资源的稳定相对路径。
- 不在这三个公开页面放置私密项目正文、私密 JSON 或私密资源 URL。

## 7. 三页视觉和交互要求

### Home / index.html

- 保持原首页的背景 shader 和整体空间感。
- 左侧个人介绍与右侧 Selected Work 在目标桌面尺寸下垂直居中。
- Selected Work 卡片的 hover 必须复现原效果：只呈现原有描边/状态，不自行增加上下浮动、额外阴影或不同的透明度。
- 点击卡片后的预览弹窗、关闭按钮、背景遮罩、模糊层级和动画要与原页面一致。
- 社交按钮及其 hover 属于 Home 独有行为，不要污染共享层。

### Works / works.html

- gallery 的列数、卡片比例、分类标题位置、左右留白和上下间距以原最终页面为准。
- hover 时页面背景的遮罩范围应覆盖整个页面；被选卡片内容清晰，卡片后方内容按原实现进行高斯模糊/毛玻璃处理。
- Works 当前的层级约定：`.works-page__scrim` 是固定的全视口变暗层，`.works-card::after` 只负责卡片局部毛玻璃，`.works-card__panel` 与活动卡片位于遮罩之上；修改时必须保持这三个职责分离。
- Works 当前层级顺序为：普通项目内容 < 共享 header < `.works-page__scrim` < hover/focus 的 `.works-card`。不要通过提升 `.works-page__content` 整体 `z-index` 来修复活动卡片层级。
- Works 的整页内容进场动画统一作用于 `.works-page__entry`，`.works-page__content` 不承载 `transform` 动画，以免破坏固定遮罩定位和卡片 `backdrop-filter` 的采样上下文。
- Works 页面浏览器标题必须保持为 `Works`，不能把作者姓名或其他页面信息拼接到 `<title>`。
- 不通过隐藏标题、复制标题或改变卡片字体来模拟模糊效果。
- 卡片宽度、四列排列、下一分类和滚动高度必须在桌面、iPad、手机上都与原页面一致。
- Works 的 quotation 文字保留原内容、字体和统一的换行标准。

### About / about.html

- About 使用与 Works 相同的正文最大宽度和页面留白，不再使用带边框、背景色和内部滚动的中心容器。
- 正文采用两栏结构：左栏依次放置 Biography、Education、Experience、Highlights；右栏放置头像、quotation 和与 Home 相同的四个社交图标。
- Highlights 原有的 Awards、Exhibitions、Press、Events、Jury 内容必须完整并入 About，不再维护独立的 Highlights 页面。
- 共享 header、导航、背景和过渡效果直接复用 main.css/main.js。
- About 的进入动画统一作用于 about-page__entry 内容根节点，必须同时覆盖左侧文字和右侧头像、quotation、社交按钮；about-page__content 保持 transform: none，避免内容定位和动画时序分离。
- 仅把 About 特有的布局和交互放在 About 自己的文件中；头像、quotation 和社交图标也属于 About 的右栏内容。

## 8. Header 和导航

- logo 与右侧导航或 hamburger 在同一水平基准线上。
- header 是悬浮层时保持原有透明状态，不额外拼接一条与正文冲突的背景色块。
- 移动端 hamburger 的尺寸、圆形边框、打开后的面板、关闭状态和点击空白处关闭，三页必须一致。
- 桌面导航使用站内相对链接，并保留原有 hover，不使用浏览器默认下划线替代设计效果。
- 页面进入和离开时使用同一套共享过渡逻辑，不能出现刷新时偶尔有、偶尔没有的竞态。

## 9. 响应式规范

响应式不是简单地把桌面缩小。必须按原页面在不同尺寸下的行为复现：

- 桌面宽屏：保持原始内容最大宽度、列宽和留白；
- iPad/中等宽度：保持原有列数或折行方式，社交栏与内容边缘正确对齐；
- 手机：切换到原有的 hamburger 导航和移动端 gallery/内容排列；
- 图片保持原有比例和裁切规则，不因通用规则被错误拉伸；
- 页面必须可以自然滚动，不能由遮罩层、固定容器或错误的 overflow 规则锁死滚动。

每次改动至少验证宽屏桌面、iPad 宽度和手机宽度；出现错位时先检查容器宽度、grid/flex、定位上下文和 overflow，再修改源规则。

## 10. 本地查看和测试

不要直接双击 HTML 使用 file:// 作为主要测试方式。请在仓库根目录运行本地静态服务器：

    python3 -m http.server 3000 --directory "Website Pages"

然后访问：

- http://localhost:3000/index.html
- http://localhost:3000/works.html
- http://localhost:3000/about.html

每次修改后检查：

- 强制刷新后三页是否稳定显示；
- header、logo、导航链接和 favicon 是否正确；
- hamburger 是否能打开、点击空白处关闭、再次打开；
- 页面是否可以滚动；
- Works 卡片和 Home 卡片的 hover、弹窗、关闭和模糊层级；
- About 中 Biography、Education、Experience、Awards、Exhibitions、Press、Events、Jury 是否完整；
- 浏览器控制台是否有错误；
- Network 是否出现 CSS、JS、字体、图片或视频 404；
- 桌面、iPad、手机三个尺寸是否保持原版布局。

## 11. 部署规则

- 只提交本次真正修改或新增的文件。
- 推送到 GitHub 后由 Vercel 自动部署。
- 部署后检查首页、/works、/about，以及旧 /highlights 兼容入口和自定义域名下的对应路径。
- 不要为了部署手动复制出第二份 assets。
- 如果部署结果与本地不同，优先检查路径大小写、构建输出、缓存和资源 404，不要直接增加覆盖式 CSS。

## 12. 认证边界

这三个核心页面是公开页面，不负责实现项目密码验证：

- 不在前端写密码比较；
- 不使用 localStorage 或 sessionStorage 保存认证状态；
- 不把受保护项目的 HTML、JSON、图片或视频放进公开页面；
- 私密项目的 server-side 验证、Cookie、路由保护和私密资源访问由独立的认证系统负责。

公开页面只负责把项目卡片链接到正确的项目路由。

## 13. 变更纪律

每次继续开发时按以下顺序：

1. 先检查当前页面实际加载了哪些 HTML、CSS、JavaScript 和资源。
2. 用 backup 对照视觉和交互结果，确认问题属于共享层还是页面独有层。
3. 只在负责该行为的源文件中修改。
4. 删除被替换且已无引用的旧选择器、旧脚本和临时覆盖规则。
5. 完成三种屏幕尺寸和控制台/Network 检查。
6. 再提交和部署。

禁止为了快速修复而继续叠加同义 class、重复 DOM、!important 覆盖链或第二套相同功能。

## 14. 当前交接状态

本文件定义的是三个核心页面重建后的目标规范和维护边界，不代表每个页面在任何屏幕尺寸下都已经完成最终验收。后续实现和修复应以本文件为唯一规则来源，并以实际浏览器测试结果确认完成。

验收完成标准：

- 三页使用新的语义化 class；
- 共享结构只由 main.css/main.js 管理；
- 每页的独特效果只保留在该页自己的文件；
- 没有旧结构残留或无引用覆盖代码；
- 原视觉、交互、动效、资源和响应式行为得到复现；
- 本地和 Vercel 部署均无资源错误。
