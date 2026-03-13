## Context

产品蓝图要求主舞台占比 65-75% 视觉权重，HUD 和日志不能遮挡办公室主体。示例原型已经验证了一套可行的布局方案：

- HUD 顶部 14px margin，grid 三栏布局
- 事件日志在底部左侧，半透明 Glass Morphism
- 控制台在底部右侧，可折叠
- 主舞台在中间区域，inset 留出 HUD 和底栏的空间

## Goals / Non-Goals

**Goals:**

- 实现不遮挡主舞台的信息层布局
- HUD 实时展示 Gateway 状态、活跃指标、事件叙事
- 事件日志消费 ProjectionStore 的叙事日志
- 控制台提供 Mock 演示触发按钮
- 路由集成让新旧 Office 可以共存和切换

**Non-Goals:**

- 不做 Raw Event Inspector 调试面板（后续迭代）
- 不做 Replay 控制（V3 考虑）
- 不做多视角切换（V2 考虑）
- 不做 Agent 筛选/过滤面板（后续迭代）

## Decisions

### D1: HUD 组件结构

```
src/components/living-office/hud/
├── HudBar.tsx              # 顶部信息条容器（grid 三栏）
├── GatewayStatus.tsx       # 左栏：Gateway 连接状态 + 事件流信息
├── EventTicker.tsx         # 中栏：事件叙事滚动条
├── StatsPanel.tsx          # 右栏：运行指标（活跃员工/待办/Cron 计数）
├── FooterBar.tsx           # 底部栏容器（grid 两栏）
├── EventLogPanel.tsx       # 底部左栏：叙事日志
├── ControlPanel.tsx        # 底部右栏：操作台 + 图例
└── MockDemoDriver.ts       # Mock 演示驱动函数
```

### D2: 布局策略——绝对定位 overlay

HUD 和 FooterBar 使用 `position: absolute` + `z-index: 20-21` 浮于主舞台之上。主舞台（`world` 容器）通过 `inset: 110px 14px 124px 14px` 为 HUD 和底栏留出空间。

**理由**：绝对定位确保 HUD 不参与文档流，不会因内容变化而推移主舞台位置。z-index 分层确保 HUD 始终可见但主舞台可交互（HUD 使用 `pointer-events: none`，内部可交互元素使用 `pointer-events: auto`）。

### D3: EventTicker 滚动实现

中栏事件叙事使用 CSS `@keyframes` 的无限滚动动画（`translateY` 循环）。列表包含 6 条叙事项，双倍复制实现无缝循环。每条叙事项显示粗体标题和灰色副文本。

### D4: Mock 演示模式

`MockDemoDriver` 提供 5 个演示函数，每个函数向 PerceptionEngine 注入预设的事件序列：

1. `triggerUserTask()` — 模拟客户消息到达 → GM 接单 → Sales 处理 → 写入记忆墙
2. `triggerCollab()` — 模拟拉起协作 → sub-agent 出现 → 协作完成
3. `triggerCron()` — 模拟 Cron 广播触发 → Finance 处理
4. `triggerHeartbeat()` — 模拟 Heartbeat 巡检 → 工位依次脉冲
5. `triggerIncident()` — 模拟阻塞 → IT 介入 → 恢复

每个函数内部使用 `await wait(ms)` 编排事件序列的时间间隔，模拟感知层的聚合和节流效果。

### D5: 路由集成

```typescript
// App.tsx 新增路由
<Route path="/living-office" element={
  <AppShell>
    <LivingOfficeView />
  </AppShell>
} />
```

使用 `AppShell` 包裹确保 Sidebar、TopBar、ChatDockBar 与旧路由一致。Sidebar 可选新增"Living Office"导航入口（带 beta 标签）。

验收后替代方案：将 `/` 路由的 element 从 `<OfficeView />` 改为 `<LivingOfficeView />`，旧 `<OfficeView />` 保留但不再有路由指向。

### D6: 响应式适配

窄屏（≤1400px）时：
- HUD 三栏变单列堆叠
- 底栏两栏变单列
- 主舞台 inset 调整，留出更多纵向空间

## Risks / Trade-offs

- **[HUD 遮挡] HUD 占据顶部和底部空间会压缩主舞台** → 通过 Glass Morphism 半透明保持空间通透感；HUD 高度控制在 88-92px；底栏控制在 92-100px
- **[Mock 演示与真实数据切换] Mock 模式的演示函数与真实 Gateway 事件走不同路径** → MockDemoDriver 产生的事件与真实 Gateway 事件类型一致，直接注入 PerceptionEngine.ingest()，确保管道一致
- **[路由共存期混淆] 用户可能不知道 `/living-office` 的存在** → 在 Sidebar 中添加可见入口；在旧 Office 视图中添加"体验新版"提示
