## ADDED Requirements

### Requirement: 当前页面状态追踪

系统 SHALL 在 office-store 中新增 `currentPage` 状态字段，用于追踪当前活动页面类型。

#### Scenario: currentPage 状态定义

- **WHEN** office-store 初始化
- **THEN** SHALL 包含 `currentPage` 字段，类型为 `"office" | "dashboard" | "channels" | "skills" | "cron" | "settings"`，初始值为 `"office"`

#### Scenario: 路由切换时同步 currentPage

- **WHEN** 用户通过路由导航切换页面
- **THEN** `currentPage` SHALL 通过 `setCurrentPage(page)` action 同步更新，以便 TopBar 等全局组件感知当前页面上下文

#### Scenario: currentPage 驱动 TopBar 模式切换

- **WHEN** `currentPage` 值为 `"office"`
- **THEN** TopBar SHALL 渲染 Office 模式（含 2D/3D 切换、Agent 指标）
- **WHEN** `currentPage` 值为其他管控页面标识
- **THEN** TopBar SHALL 渲染 Console 模式（含「返回 Office」按钮、页面标题）
