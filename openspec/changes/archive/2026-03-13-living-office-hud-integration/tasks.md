## 1. HUD 顶部信息条

- [ ] 1.1 创建 `src/components/living-office/hud/HudBar.tsx`——顶部三栏容器（CSS Grid 280px/1fr/250px），Glass Morphism + pointer-events 穿透
- [ ] 1.2 创建 `src/components/living-office/hud/GatewayStatus.tsx`——Gateway 状态卡片（连接灯 + 事件流信息），消费 ProjectionStore.gatewayStream + 连接状态
- [ ] 1.3 创建 `src/components/living-office/hud/EventTicker.tsx`——事件叙事滚动条（CSS @keyframes 无缝循环滚动，14s 周期）
- [ ] 1.4 创建 `src/components/living-office/hud/StatsPanel.tsx`——运行指标卡片（活跃员工/待办/Cron 计数），消费 ProjectionStore 实时数据

## 2. 底部栏

- [ ] 2.1 创建 `src/components/living-office/hud/FooterBar.tsx`——底部两栏容器（CSS Grid 1fr/390px）
- [ ] 2.2 创建 `src/components/living-office/hud/EventLogPanel.tsx`——叙事日志面板（最近 3-7 条叙事句 + 时间戳），消费 ProjectionStore.narrativeLog
- [ ] 2.3 创建 `src/components/living-office/hud/ControlPanel.tsx`——操作台（5 个演示按钮 + 状态图例），分色按钮（蓝/紫/橙/红）

## 3. Mock 演示驱动

- [ ] 3.1 创建 `src/components/living-office/hud/MockDemoDriver.ts`，实现 5 个演示函数
- [ ] 3.2 实现 `triggerUserTask()`——客户消息到达完整序列（Gateway → GM → Sales → 记忆墙），带时间编排
- [ ] 3.3 实现 `triggerCollab()`——拉起协作序列（GM → 项目室 → sub-agent → 完成）
- [ ] 3.4 实现 `triggerCron()`——Cron 广播序列（广播 → Finance 处理 → 完成）
- [ ] 3.5 实现 `triggerHeartbeat()`——Heartbeat 巡检序列（工位依次脉冲 260ms 间隔）
- [ ] 3.6 实现 `triggerIncident()`——制造阻塞序列（Ops 阻塞 → 保留 4.2s → IT 排查 → 恢复）
- [ ] 3.7 实现自动播放模式——12 秒间隔循环执行 4 个主要演示

## 4. 路由集成

- [ ] 4.1 在 `App.tsx` 中新增 `/living-office` 路由，使用 `AppShell` 布局包裹 `LivingOfficeView`
- [ ] 4.2 在 Sidebar 导航中添加 "Living Office (Beta)" 入口
- [ ] 4.3 在旧 Office 视图中添加"体验新版 Living Office"非侵入提示，支持 localStorage 关闭记忆
- [ ] 4.4 更新 `PAGE_MAP` 映射，注册 `living-office` 页面 ID

## 5. 主视图组装

- [ ] 5.1 在 `LivingOfficeView.tsx` 中组装完整布局——HudBar + OfficeStage（含分区/工位/角色/面板）+ FooterBar
- [ ] 5.2 连接 ProjectionStore 到所有 HUD 组件的数据消费
- [ ] 5.3 连接 ControlPanel 按钮到 MockDemoDriver 函数
- [ ] 5.4 添加响应式断点处理（≤1400px 时 HUD 单列堆叠 + 底栏单列 + 场景缩放）

## 6. 测试与验证

- [ ] 6.1 为 HUD 组件（HudBar、GatewayStatus、StatsPanel）编写基础渲染测试
- [ ] 6.2 为 EventLogPanel 编写日志滚动测试
- [ ] 6.3 为路由注册编写导航测试（访问 /living-office 渲染正确组件）
- [ ] 6.4 验证 TypeScript 类型检查通过
- [ ] 6.5 验证 Lint 检查通过
- [ ] 6.6 端到端验证：Mock 模式下访问 /living-office，点击所有演示按钮，确认场景、角色、HUD 同步响应
