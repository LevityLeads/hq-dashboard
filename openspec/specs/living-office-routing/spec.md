# living-office-routing Specification

## Purpose
TBD - created by archiving change living-office-hud-integration. Update Purpose after archive.
## Requirements
### Requirement: Living Office 路由注册

系统 SHALL 在 `App.tsx` 中新增 `/living-office` 路由，使用 `AppShell` 布局包裹 `LivingOfficeView` 组件。路由 SHALL 与现有的 `/`（旧 Office 视图）并存。

#### Scenario: 路由可访问
- **WHEN** 用户在浏览器中访问 `/#/living-office`
- **THEN** 系统 SHALL 渲染 Living Office 2.5D 视图，包含完整的场景、角色、HUD 和控制台

#### Scenario: 旧路由不受影响
- **WHEN** 用户在浏览器中访问 `/#/`
- **THEN** 系统 SHALL 继续渲染旧的 2D/3D Office 视图，行为不变

### Requirement: Sidebar 导航入口

系统 SHALL 在 Sidebar 导航菜单中添加"Living Office"入口（可选带 "Beta" 标签），链接到 `/living-office` 路由。

#### Scenario: 导航可见
- **WHEN** Sidebar 展开
- **THEN** SHALL 显示"Living Office"导航项，带有区分性图标和 Beta 标签

### Requirement: 新旧切换提示

系统 SHALL 在旧 Office 视图中显示一条非侵入式提示（如底部横幅或角落按钮），引导用户尝试新的 Living Office 视图。

#### Scenario: 提示可见
- **WHEN** 用户访问旧 Office 视图（`/#/`）
- **THEN** 页面 SHALL 在非遮挡位置显示"体验新版 Living Office"提示

#### Scenario: 提示可关闭
- **WHEN** 用户关闭提示
- **THEN** 提示 SHALL 不再显示（通过 localStorage 记忆）

### Requirement: 路由替代策略

当 Living Office 通过验收后，系统 SHALL 支持通过修改单一路由配置将 `/` 路由指向 `LivingOfficeView`。旧的 `OfficeView` 代码 SHALL 保留但不再被路由引用。

#### Scenario: 路由切换
- **WHEN** 开发者将 `/` 路由的 element 从 `<OfficeView />` 改为 `<LivingOfficeView />`
- **THEN** 所有访问 `/#/` 的用户 SHALL 看到新的 Living Office 视图
- **THEN** 旧 `OfficeView` 组件文件 SHALL 保留不被删除

### Requirement: 自动播放模式

系统 SHALL 支持在 Mock 模式下自动循环播放演示序列。自动播放 SHALL 每隔 12 秒依次执行 4 个主要演示函数（triggerUserTask → triggerHeartbeat → triggerCollab → triggerCron），持续循环。

#### Scenario: 自动播放启动
- **WHEN** Living Office 视图在 Mock 模式下加载
- **THEN** 系统 SHALL 自动开始循环播放演示序列

#### Scenario: 手动触发中断自动播放
- **WHEN** 用户手动点击控制台按钮
- **THEN** 手动触发的演示 SHALL 立即执行，不与自动播放冲突（排队执行）

