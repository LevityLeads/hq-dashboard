## Why

2.5D 场景是"主舞台"，但用户还需要围绕主舞台的信息层（HUD）和操作层（控制台）才能完整地观测和管理 OpenClaw 组织运转。

产品蓝图定义了四层页面架构：
- **A. 主舞台层**——2.5D 办公室（由子提案1-3完成）
- **B. 轻 HUD 层**——顶部信息条，显示 Gateway 状态、活跃员工数、待办数、当前主线
- **C. 事件日志层**——底部半透明日志，最近 3-5 条叙事句
- **D. 控制/调试层**——右下角操作台，可折叠

本提案实现 B/C/D 三个 overlay 层，并完成与路由系统的集成——将新的 Living Office 注册为可访问路由，最终替代旧的 `/` 路由。

## What Changes

- **新增 HUD 顶部信息条**：三栏布局（Gateway 状态 + 事件流转叙事 + 运行指标），Glass Morphism 风格，不遮挡主舞台
- **新增事件日志条**：底部左侧半透明日志面板，显示最近 3-7 条叙事句（消费 ProjectionStore 的 narrativeLog）
- **新增控制操作台**：底部右侧操作按钮区，包含交互触发按钮（Mock 模式下的演示控制）和状态图例
- **新增事件流转叙事滚动条**：HUD 中部的 Ticker 组件，自动滚动显示关键叙事
- **路由集成**：新增 `/living-office` 路由（开发阶段），提供切换入口，待验收后替代 `/`
- **Mock 演示模式**：在 Mock 模式下提供"客户消息到达"、"拉起协作"、"触发 Cron"、"触发 Heartbeat"、"制造阻塞"五个演示按钮，驱动完整的感知层 → 场景层管道

## Capabilities

### New Capabilities
- `living-office-hud`: HUD 信息层——顶部三栏信息条（Gateway 状态/事件叙事/运行指标），底部日志条和控制台
- `living-office-routing`: 路由集成——Living Office 路由注册、新旧共存策略、Mock 演示模式

### Modified Capabilities

（不修改现有能力）

## Impact

- **新增文件**：`src/components/living-office/hud/` 目录（6-8 个组件文件）
- **修改文件**：`src/App.tsx`（新增路由）、`src/components/layout/Sidebar.tsx`（新增导航入口，可选）
- **依赖**：消费 ProjectionStore 数据
- **Mock 模式**：新增 Living Office 专用的 Mock 演示驱动函数
