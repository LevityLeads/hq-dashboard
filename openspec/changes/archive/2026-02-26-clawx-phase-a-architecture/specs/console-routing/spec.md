## ADDED Requirements

### Requirement: React Router 路由系统

系统 SHALL 使用 `react-router-dom` 的 `HashRouter` 建立前端路由系统，支持 Office（主页）与管控页面的 URL 路由切换。

#### Scenario: 应用启动时加载 Office 主页

- **WHEN** 用户首次打开应用（URL 为 `/#/` 或无 hash）
- **THEN** 系统 SHALL 渲染 Office 视图（2D/3D 办公室），路由路径为 `/`

#### Scenario: 通过 URL 直接访问管控页面

- **WHEN** 用户通过 URL hash 直接访问 `/#/dashboard`、`/#/channels`、`/#/skills`、`/#/cron` 或 `/#/settings`
- **THEN** 系统 SHALL 渲染对应的管控页面组件

#### Scenario: 访问不存在的路由

- **WHEN** 用户访问未定义的路由路径
- **THEN** 系统 SHALL 自动重定向到 Office 主页（`/`）

### Requirement: 路由定义结构

系统 SHALL 定义以下路由层级，使用 layout route 区分 Office 布局与管控页面布局。

#### Scenario: Office 路由使用 AppShell 布局

- **WHEN** 当前路由为 `/`
- **THEN** 系统 SHALL 使用现有 `AppShell` 组件作为布局容器，渲染 `OfficeView`（含 TopBar、右侧 Sidebar、ActionBar）

#### Scenario: 管控页面路由使用 ConsoleLayout 布局

- **WHEN** 当前路由为 `/dashboard`、`/channels`、`/skills`、`/cron` 或 `/settings`
- **THEN** 系统 SHALL 使用 `ConsoleLayout` 组件作为布局容器，渲染 TopBar + 内容区域（无 Office 右侧 Sidebar）

### Requirement: TopBar「控制台」菜单入口

系统 SHALL 在 TopBar 组件中添加「控制台」下拉菜单，作为管控页面的导航入口。

#### Scenario: 控制台菜单按钮展示

- **WHEN** TopBar 渲染完成
- **THEN** TopBar SHALL 在右侧区域（连接状态指示灯左侧）显示一个「控制台」按钮，使用 `LayoutDashboard` 图标

#### Scenario: 点击控制台菜单按钮

- **WHEN** 用户点击「控制台」按钮
- **THEN** 系统 SHALL 显示下拉菜单，包含以下导航项（每项带图标）：
  - Dashboard（`Home` 图标）
  - Channels（`Radio` 图标）
  - Skills（`Puzzle` 图标）
  - Cron（`Clock` 图标）
  - Settings（`Settings` 图标）

#### Scenario: 控制台菜单项高亮

- **WHEN** 当前路由匹配某个管控页面路径
- **THEN** 对应的菜单项 SHALL 显示为高亮/选中状态

#### Scenario: 从管控页面返回 Office

- **WHEN** 用户在管控页面中
- **THEN** TopBar SHALL 额外显示「返回 Office」按钮（或标题区域可点击返回），点击后 SHALL 导航到 `/`

### Requirement: 导航不中断 Gateway 连接

路由切换 SHALL NOT 中断现有的 WebSocket Gateway 连接。

#### Scenario: 从 Office 切换到管控页面

- **WHEN** 用户从 Office 视图导航到 Dashboard 页面
- **THEN** WebSocket 连接 SHALL 保持不变，连接状态 SHALL 不发生重连

#### Scenario: 从管控页面返回 Office

- **WHEN** 用户从管控页面返回 Office 视图
- **THEN** Office 视图 SHALL 正常渲染，Agent 状态 SHALL 保持路由切换前的状态
