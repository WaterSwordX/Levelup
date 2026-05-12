# Design System: Levelup — 技能时间追踪

## 1. Visual Theme & Atmosphere

**"Midnight Observatory"** — 一个深邃而温暖的数字观测站，用于追踪技能成长的轨迹。

- **Density:** 5/10 — Daily App Balanced，信息密度适中，留白充足
- **Variance:** 7/10 — Offset Asymmetric，布局不对称但有序，避免单调的网格堆叠
- **Motion:** 7/10 — Fluid CSS + Spring Physics，流畅的微交互和状态转换
- **Creativity:** 8/10 — 大胆但克制，每个元素都有存在的理由

整体氛围如同深夜的工作室——温暖的琥珀色光芒穿透深沉的碳黑背景，像是黑暗中的一盏台灯，专注而宁静。界面应该让人感到"时间在这里被珍视"，而不是被冰冷的数字淹没。

## 2. Color Palette & Roles

### 基础色板（深色主题）

- **Deep Void** (#08090D) — 最深层背景，body底色，营造深邃感
- **Carbon Base** (#0F1116) — 主背景面，卡片和容器的基底
- **Slate Surface** (#161820) — 次级表面，hover状态，输入框背景
- **Slate Raised** (#1C1F28) — 提升的表面，用于活动状态
- **Whisper Border** (rgba(255, 255, 255, 0.05)) — 结构性边框，分割线
- **Ghost Border** (rgba(255, 255, 255, 0.09)) — hover态边框，强调分割
- **Active Border** (rgba(255, 255, 255, 0.14)) — 活动态边框

### 文字色阶

- **Bright Chalk** (#F0F1F3) — 主要文字，标题，关键数据
- **Silver Mist** (#9CA0AB) — 次要文字，描述，元数据
- **Slate Ghost** (#5A5E6B) — 禁用态，占位符，辅助信息

### 功能强调色（单色系统）

- **Ember Glow** (#E8941A) — 主强调色，CTA按钮，活跃状态，焦点环
  - 色值: hsl(36, 82%, 50%)，饱和度78%
  - 衍生: Ember Soft (rgba(232, 148, 26, 0.12)) 用于背景高亮
  - 衍生: Ember Ghost (rgba(232, 148, 26, 0.25)) 用于光晕效果

### 辅助语义色（用于数据可视化和状态）

- **Coral Pulse** (#E86B6B) — 警告，删除操作，下降趋势
  - 衍生: Coral Soft (rgba(232, 107, 107, 0.12))
- **Teal Flow** (#4ECDC4) — 成功，增长，活跃天数
  - 衍生: Teal Soft (rgba(78, 205, 196, 0.12))
- **Iris Whisper** (#A78BFA) — 里程碑，特殊成就，装饰性元素
  - 衍生: Iris Soft (rgba(167, 139, 250, 0.12))

### 禁止的色彩模式

- 禁止使用纯黑 (#000000)
- 禁止使用霓虹紫/蓝渐变
- 禁止饱和度超过80%的强调色
- 禁止多色渐变按钮
- 禁止彩虹色或全息效果

## 3. Typography Rules

### 字体栈

- **Display/Headlines:** `Space Grotesk` — 几何感强，适合标题和数据展示
  - 字重: 700 (Bold) 用于页面标题
  - 字重: 600 (Semibold) 用于区块标题
  - Letter-spacing: -0.02em (track-tight) 用于大标题

- **Body/Content:** `DM Sans` — 清晰易读，适合长文本
  - 字重: 400 (Regular) 用于正文
  - 字重: 500 (Medium) 用于标签和强调
  - Line-height: 1.6 用于正文，保证可读性

- **Mono/Data:** `JetBrains Mono` — 等宽字体，用于数字、时间、代码
  - 用于: 计时器显示、统计数据、时间戳
  - 字重: 600 (Semibold) 用于关键数据

### 字号层级

```
页面标题:    1.75rem / 28px  (Space Grotesk 700)
区块标题:    1.125rem / 18px (Space Grotesk 600)
子标题:      1rem / 16px     (DM Sans 500)
正文:        0.875rem / 14px (DM Sans 400)
辅助文字:    0.8125rem / 13px (DM Sans 400)
小标签:      0.75rem / 12px  (DM Sans 500)
微型数据:    0.6875rem / 11px (DM Sans 400)
```

### 数字显示规则

- 所有时间数据使用 `JetBrains Mono`
- 大数字 (统计卡片) 使用 `Space Grotesk 700`
- 小数字 (列表项) 使用 `JetBrains Mono 500`

### 禁止的字体模式

- 禁止使用 Inter（过于泛用）
- 禁止使用 Times New Roman, Georgia, Garamond 等传统衬线体
- 禁止在仪表盘使用衬线字体

## 4. Component Stylings

### Buttons

**Primary Button (btn-primary)**
- 背景: 线性渐变 (135deg, #E8941A, #D4840F)
- 文字: #111318 (深色)
- 圆角: 12px
- 阴影: 0 4px 12px rgba(232, 148, 26, 0.2)
- Hover: 阴影增强至 0 6px 20px rgba(232, 148, 26, 0.35), translateY(-1px)
- Active: translateY(0), 阴影减弱
- 禁用: opacity 0.4, 无阴影，无transform

**Ghost Button (btn-ghost)**
- 背景: transparent
- 边框: 1px solid var(--whisper-border)
- 文字: var(--silver-mist)
- Hover: 背景 rgba(255, 255, 255, 0.04), 边框 var(--ghost-border), 文字 var(--bright-chalk)
- Active: 背景 rgba(255, 255, 255, 0.06)

**Icon Button**
- 尺寸: 36px x 36px
- 圆角: 10px
- 背景: transparent
- Hover: 背景 rgba(255, 255, 255, 0.06)
- 危险操作: hover时文字变 coral-pulse，背景 rgba(232, 107, 107, 0.1)

### Cards (surface-card)

**基础卡片**
- 背景: var(--carbon-base)
- 边框: 1px solid var(--whisper-border)
- 圆角: 16px
- Hover: 边框 var(--ghost-border), 背景 var(--slate-surface)

**提升卡片 (surface-raised)**
- 背景: var(--slate-surface)
- 边框: 1px solid var(--whisper-border)
- 圆角: 16px
- 用于需要更高对比度的场景

**数据卡片 (stat-card)**
- 继承 surface-card
- 内部间距: 16px
- 图标容器: 32px x 32px, 圆角8px, 背景色为强调色的15%透明度
- 数字: JetBrains Mono 600, 1.25rem
- 标签: DM Sans 400, 0.75rem, slate-ghost

### Inputs (input-field)

- 背景: rgba(0, 0, 0, 0.25)
- 边框: 1px solid var(--whisper-border)
- 圆角: 12px
- 内边距: 10px 14px
- 文字: var(--bright-chalk)
- 占位符: var(--slate-ghost)
- Focus: 边框变为 ember-glow, box-shadow: 0 0 0 3px rgba(232, 148, 26, 0.15)
- 标签位于输入框上方，DM Sans 500, 0.875rem, silver-mist

### Progress Bar

- 轨道: height 4px, 背景 rgba(255, 255, 255, 0.04), 圆角 100px
- 填充: height 100%, 纯色背景（分类色）, 圆角 100px
- 动画: transition width 0.6s cubic-bezier(0.22, 1, 0.36, 1)
- 无光晕效果

### Navigation

**桌面侧边栏**
- 宽度: 240px
- 背景: 微妙渐变 (rgba(255,255,255,0.03) → rgba(255,255,255,0.01))
- 右边框: 1px solid var(--whisper-border)
- 导航项: 40px高度, 圆角12px, 左侧8px padding
- 活跃态: 文字变为 ember-glow, 背景 ember-soft, 右侧有小圆点指示器

**移动底部导航**
- 高度: 64px
- 背景: rgba(17, 19, 24, 0.9) + backdrop-filter: blur(20px)
- 顶边框: 1px solid var(--whisper-border)
- 图标: 24px, 居中
- 标签: 10px, 紧凑

### Timer Display

- 数字: JetBrains Mono 700, 大尺寸 (3rem+)
- 分隔符: 冒号使用 silver-mist
- 背景: 可选的微光效果
- 状态指示: 运行中 ember-glow, 暂停 silver-mist

### Milestone Badge

- 背景: iris-whisper 的 12% 透明度
- 边框: 1px solid iris-whisper 的 20% 透明度
- 图标: Award 或 Star, iris-whisper 颜色
- 数字: Space Grotesk 600
- 光晕: 0 0 20px iris-whisper 的 15% 透明度

### Empty State

- 容器: glass-card, 大内边距 (48px+)
- 图标: 48px+, 使用强调色的软版本背景
- 标题: Space Grotesk 600, 1.25rem
- 描述: DM Sans 400, 0.875rem, silver-mist, max-width 320px

### Loading State

- 骨架屏: 匹配实际布局尺寸
- 背景: rgba(255, 255, 255, 0.04)
- 动画: shimmer 效果，从左到右
- 禁止使用通用的圆形 spinner

## 5. Layout Principles

### 整体架构

- 使用 CSS Grid 进行主要布局
- 侧边栏 + 主内容区的两栏布局（桌面）
- 单栏堆叠布局（移动）
- 最大内容宽度: 1024px (max-w-5xl)
- 内容区内边距: 32px (桌面), 16px (移动)

### 间距系统

```
xs:  4px   — 图标与文字间距
sm:  8px   — 紧凑元素间距
md:  12px  — 表单元素间距
lg:  16px  — 卡片内边距，区块间距
xl:  24px  — 页面区块间距
2xl: 32px  — 大区块间距
```

### 卡片网格

- 概览卡片: 2列 (移动) / 4列 (桌面)，gap 12px
- 技能卡片: 1列 (移动) / 2列 (桌面)，gap 12px
- 目标卡片: 1列 (移动) / 2列 (桌面)，gap 12px
- 避免3列等宽网格（禁止的反模式）

### 响应式断点

- Mobile: < 768px — 单栏，底部导航
- Tablet: 768px - 1024px — 可选侧边栏或保持单栏
- Desktop: > 1024px — 侧边栏 + 主内容

### 移动端规则

- 所有多列布局在 < 768px 堆叠为单列
- 禁止水平滚动
- 触摸目标最小 44px
- 底部导航固定定位
- 主内容区底部增加 96px padding（为底部导航留空）

## 6. Motion & Interaction

### 动画引擎

- 使用 CSS transitions 和 animations
- 优先使用 transform 和 opacity（硬件加速）
- 禁止动画 top, left, width, height

### Spring Physics

```css
/* 平滑过渡 */
transition: all 0.15s ease;

/* 进入动画 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 微交互

**卡片 Hover**
- 边框变亮: var(--whisper-border) → var(--ghost-border)
- 背景色变化: var(--carbon-base) → var(--slate-surface)
- 过渡: 0.15s ease

**按钮交互**
- Hover: 背景色变化，无 translateY
- Active: 背景色变深
- 过渡: 0.15s ease

**导航项**
- Hover: 背景色 var(--slate-surface)
- Active: 背景色 var(--ember-soft), 文字变为 ember-glow
- 过渡: 0.15s ease

### 入场动画

**列表项级联**
```css
.stagger-children > :nth-child(1) { animation-delay: 0ms; }
.stagger-children > :nth-child(2) { animation-delay: 50ms; }
.stagger-children > :nth-child(3) { animation-delay: 100ms; }
/* ... 最多8项 */
```

**页面切换**
- fadeInUp: 0.4s cubic-bezier(0.16, 1, 0.3, 1)
- 延迟: 0ms - 150ms 根据元素层级

### 进度条动画

- 宽度变化: 0.6s cubic-bezier(0.22, 1, 0.36, 1)
- 光晕脉冲: 可选的 breathe 动画

### 计时器动画

- 数字变化: 快速淡入淡出
- 状态切换: 平滑的颜色过渡

## 7. Anti-Patterns (Banned)

### 色彩禁忌
- 禁止纯黑 (#000000)
- 禁止霓虹紫/蓝渐变
- 禁止饱和度 > 80% 的强调色
- 禁止彩虹/全息效果
- 禁止多色渐变按钮

### 排版禁忌
- 禁止使用 Inter 字体
- 禁止使用传统衬线体 (Times New Roman, Georgia, Garamond)
- 禁止在仪表盘使用衬线字体
- 禁止 ALL CAPS 标题（除非是小标签）

### 布局禁忌
- 禁止3列等宽卡片网格
- 禁止居中的 Hero 区域（当 variance > 4）
- 禁止水平溢出（移动端致命错误）
- 禁止重叠元素

### 组件禁忌
- 禁止通用圆形 spinner
- 禁止霓虹外发光阴影
- 禁止自定义鼠标光标
- 禁止浮动标签输入框

### 内容禁忌
- 禁止使用表情符号 (emoji)
- 禁止 AI 文案陈词滥调 ("Elevate", "Seamless", "Unleash", "Next-Gen")
- 禁止填充性 UI 文字 ("Scroll to explore", "Swipe down")
- 禁止假数据或统计数字
- 禁止通用占位名 ("John Doe", "Acme")
- 禁止假的精确数字 (99.99%, 50%)

### 动画禁忌
- 禁止线性缓动 (linear easing)
- 禁止动画 top, left, width, height
- 禁止无意义的弹跳动画

## 8. Special Considerations

### 设计原则

**移除 Glass Morphism**
- 不再使用 backdrop-filter: blur()
- 使用实心背景色 (var(--carbon-base)) 替代半透明背景
- 保持简洁的边框和阴影系统

**卡片设计**
- 使用 surface-card 或 surface-raised 类
- 避免过度装饰，保持内容焦点
- 使用微妙的 hover 状态变化

### 数据可视化

- 使用分类自定义颜色
- 图表颜色饱和度保持在 60-70%
- 避免过于鲜艳的颜色组合
- 深色背景下确保足够的对比度

### 无障碍性

- 文字与背景对比度至少 4.5:1
- 交互元素有明确的焦点状态
- 颜色不作为唯一的信息传达方式
- 触摸目标最小 44px

---

*This design system enforces a premium, non-generic aesthetic for the Levelup skill tracking application. Every decision prioritizes clarity, warmth, and a sense of time being valued.*
