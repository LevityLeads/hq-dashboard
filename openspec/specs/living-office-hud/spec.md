# living-office-hud Specification

## Purpose
TBD - created by archiving change living-office-hud-integration. Update Purpose after archive.
## Requirements
### Requirement: HUD 顶部信息条

系统 SHALL 渲染 `HudBar` 组件，使用 CSS Grid 三栏布局（280px / 1fr / 250px），固定在视口顶部（top: 14px, left: 14px, right: 14px）。HudBar SHALL 使用 `z-index: 20` 浮于主舞台之上，默认 `pointer-events: none`（内部可交互元素设为 `auto`）。

#### Scenario: HUD 不遮挡交互
- **WHEN** 用户点击 HUD 覆盖区域但未点击 HUD 卡片
- **THEN** 点击 SHALL 穿透到下方的主舞台

#### Scenario: 三栏布局
- **WHEN** 视口宽度 > 1400px
- **THEN** HUD SHALL 显示三栏水平布局：左（Gateway 状态）、中（事件叙事）、右（运行指标）

### Requirement: Gateway 状态卡片

HUD 左栏 SHALL 渲染 `GatewayStatus` 卡片，Glass Morphism 风格，显示：

- 标题"Gateway 中控大厅"
- 副标题说明 Gateway 的角色
- 右上角连接状态指示灯（绿色圆点 + "WS 在线" 标签）
- 下方 3-4 行事件流状态信息（如 `client.message → 待分发`、`agent.heartbeat → stable`）

事件流信息 SHALL 从 ProjectionStore 的 `gatewayStream` 读取。

#### Scenario: 在线状态
- **WHEN** Gateway WebSocket 连接正常
- **THEN** 状态灯 SHALL 显示绿色 + "WS 在线"

#### Scenario: 断线状态
- **WHEN** Gateway WebSocket 断开
- **THEN** 状态灯 SHALL 显示红色 + "WS 断开"

### Requirement: 事件流转叙事滚动条

HUD 中栏 SHALL 渲染 `EventTicker` 组件：

- 标题"事件流转叙事"
- 副标题"把毫秒级系统事件压缩成秒级可感知组织行为"
- 右上角 "Perception Layer" 标签
- 内容区域为自动滚动的叙事条目列表，每条包含粗体标题和灰色说明
- 使用 CSS `@keyframes` 实现无缝循环滚动（14 秒周期）

#### Scenario: 叙事滚动
- **WHEN** EventTicker 渲染完成
- **THEN** 叙事条目 SHALL 自动从下向上滚动，循环播放

### Requirement: 运行指标卡片

HUD 右栏 SHALL 渲染 `StatsPanel` 卡片，三格布局显示：

- **活跃员工**——当前非 IDLE 状态的 Agent 数量
- **待处理事务**——当前待处理的队列长度
- **定时广播**——当前活跃的 Cron 任务数

每个指标显示为大字号数值 + 灰色标签。数值 SHALL 从 ProjectionStore 实时读取。

#### Scenario: 指标实时更新
- **WHEN** Agent 状态从 IDLE 变为 WORKING
- **THEN** "活跃员工"计数 SHALL 即时 +1

### Requirement: 事件日志面板

系统 SHALL 在视口底部左侧渲染 `EventLogPanel`，Glass Morphism 半透明风格，高度 92px：

- 标题"事件日志"
- 副标题"半透明底栏，避免遮挡办公室主体"
- 右上角 "Narrative Log" 标签
- 内容区域显示最近 3-7 条叙事日志，每条包含时间戳（HH:MM:SS）和叙事文本
- 新日志追加到底部，最旧的日志在最上面

日志数据 SHALL 从 ProjectionStore 的 `narrativeLog` 读取。

#### Scenario: 日志滚动
- **WHEN** 新叙事日志产生
- **THEN** 日志面板 SHALL 添加新条目到列表底部，如超过 7 条则淘汰最旧条目

#### Scenario: 半透明不遮挡
- **WHEN** 日志面板渲染时
- **THEN** 面板 SHALL 使用半透明背景（opacity 约 0.6-0.7），主舞台在其下方仍然隐约可见

### Requirement: 控制操作台

系统 SHALL 在视口底部右侧渲染 `ControlPanel`，Glass Morphism 风格：

- 标题"交互触发"
- 副标题"保留控制，但缩成右下角操作台"
- 右上角 "Preview Controls" 标签
- 操作按钮行：5 个按钮（客户消息到达、拉起协作、触发 Cron、触发 Heartbeat、制造阻塞）
- 图例行：状态颜色说明（空闲/正常、忙碌/执行中、阻塞/异常、Heartbeat、Cron）

按钮颜色分类：
- 默认蓝色调（客户消息、Heartbeat）
- 紫色调（拉起协作）
- 橙色调（触发 Cron）
- 红色调（制造阻塞）

#### Scenario: 按钮触发演示
- **WHEN** 用户点击"客户消息到达"按钮
- **THEN** 系统 SHALL 执行完整的客户消息到达演示序列（Gateway 接收 → GM 分发 → Sales 处理 → 写入记忆墙）

#### Scenario: 图例清晰
- **WHEN** 控制台渲染时
- **THEN** 图例 SHALL 显示三种状态颜色的含义和两种机制的说明

### Requirement: Mock 演示驱动

系统 SHALL 提供 `MockDemoDriver` 模块，包含 5 个演示函数。每个函数 SHALL 向 PerceptionEngine 注入一系列带时间间隔的事件，模拟完整的业务流程：

1. `triggerUserTask()` — 客户消息 → GM 接单（0.85s）→ Sales 分析（1.5s）→ 完成写入
2. `triggerCollab()` — GM 拉起协作（0.9s）→ sub-agent 出现（1.5s）→ 协作完成
3. `triggerCron()` — Cron 广播（1.2s）→ Finance 处理（1.2s）→ 广播完成
4. `triggerHeartbeat()` — 工位依次巡检（每个间隔 260ms）→ 全部完成
5. `triggerIncident()` — Ops 阻塞（1.8s）→ 阻塞保留 4.2s → IT 排查（1.3s）→ 恢复

#### Scenario: 演示序列完整
- **WHEN** 用户触发任何一个演示
- **THEN** 系统 SHALL 按预设的时间序列执行完整流程，感知层、场景层、HUD 同步响应

### Requirement: 底部栏布局

底部栏 SHALL 使用 CSS Grid 两栏布局（`minmax(0, 1fr)` + `390px`），固定在视口底部（bottom: 14px），`z-index: 21`。

#### Scenario: 底部栏对齐
- **WHEN** 视口宽度 > 1400px
- **THEN** 底部栏 SHALL 显示左右两栏：左侧事件日志（自适应宽度）、右侧控制台（390px 固定宽度）

