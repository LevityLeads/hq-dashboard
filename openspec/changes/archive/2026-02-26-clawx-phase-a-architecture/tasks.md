## 1. 依赖安装与项目配置

- [x] 1.1 安装 `react-router-dom` 依赖：`pnpm add react-router-dom`
- [x] 1.2 在 `tsconfig.json` 中确认路径别名 `@/` 正常工作，检查 vite.config.ts 的 resolve.alias 配置

## 2. Gateway Adapter 接口层

- [x] 2.1 创建 `src/gateway/adapter-types.ts`：定义管控页面使用的 Gateway 数据类型（ChannelInfo、SkillInfo、CronTask、ChatMessage、SessionInfo 等），参考 ClawX stores 中的类型
- [x] 2.2 创建 `src/gateway/adapter.ts`：定义 `GatewayAdapter` 接口，包含所有领域方法签名（connect、disconnect、onEvent、chatHistory、chatSend、chatAbort、sessionsList、channelsStatus、skillsStatus、cronList、cronAdd、cronUpdate、cronRemove、cronRun、agentsList、toolsCatalog、usageStatus）
- [x] 2.3 创建 `src/gateway/mock-adapter.ts`：实现 `MockAdapter` 类，为每个接口方法返回合理的模拟数据
- [x] 2.4 创建 `src/gateway/ws-adapter.ts`：实现 `WsAdapter` 类，通过现有 `rpc-client.ts` 的 `callRpc` 调用真实 Gateway
- [x] 2.5 创建 `src/gateway/adapter-provider.ts`：根据 `VITE_MOCK` 环境变量导出对应的 Adapter 单例

## 3. Domain Mapping 层

- [x] 3.1 创建 `src/lib/view-models.ts`：定义 ChannelCardVM、SkillCardVM、CronTaskCardVM 等 ViewModel 类型
- [x] 3.2 在 `src/lib/view-models.ts` 中实现基础转换函数骨架（toChannelCardVM、toSkillCardVM、toCronTaskCardVM），至少完成字段映射和 status → statusLabel/statusColor 转换

## 4. Console Stores 骨架

- [x] 4.1 创建 `src/store/console-stores/` 目录
- [x] 4.2 创建 `src/store/console-stores/dashboard-store.ts`：状态定义（gatewayStatus、channelsSummary、skillsSummary、uptime、isLoading、error）和 refresh() action
- [x] 4.3 创建 `src/store/console-stores/channels-store.ts`：状态定义（channels、isLoading、error）和 fetchChannels() action
- [x] 4.4 创建 `src/store/console-stores/skills-store.ts`：状态定义（skills、isLoading、error）和 fetchSkills() action
- [x] 4.5 创建 `src/store/console-stores/cron-store.ts`：状态定义（tasks、isLoading、error）和 CRUD actions 签名
- [x] 4.6 创建 `src/store/console-stores/settings-store.ts`：状态定义（theme、language）和 localStorage 持久化逻辑
- [x] 4.7 创建 `src/store/console-stores/chat-dock-store.ts`：状态定义（messages、isStreaming、currentSessionKey、dockExpanded）和 actions 签名

## 5. Office Store 扩展

- [x] 5.1 在 `src/gateway/types.ts` 中新增 `PageId` 类型：`"office" | "dashboard" | "channels" | "skills" | "cron" | "settings"`
- [x] 5.2 在 `office-store.ts` 中新增 `currentPage: PageId` 状态字段（初始值 `"office"`）和 `setCurrentPage(page: PageId)` action

## 6. 路由系统与全局布局

- [x] 6.1 修改 `src/main.tsx`：用 `HashRouter` 包裹 `App` 组件
- [x] 6.2 创建 `src/components/layout/ConsoleLayout.tsx`：管控页面布局组件（TopBar + 内容区域，带内边距和最大宽度约束）
- [x] 6.3 重构 `src/App.tsx`：引入 React Router 的 `Routes`/`Route`，定义 Office 路由（`/` → AppShell + OfficeView）和管控页面路由（`/dashboard` `/channels` `/skills` `/cron` `/settings` → ConsoleLayout + 骨架页面），保持 ThemeSync 和 useGatewayConnection 在路由外层
- [x] 6.4 在路由组件中通过 `useLocation` 同步 `currentPage` 到 office-store

## 7. TopBar 控制台菜单

- [x] 7.1 修改 `src/components/layout/TopBar.tsx`：新增 `ConsoleMenu` 子组件——下拉菜单按钮（LayoutDashboard 图标 + "控制台" 文字），菜单项含 Dashboard/Channels/Skills/Cron/Settings 及各自图标
- [x] 7.2 实现菜单项的路由导航（使用 `useNavigate`）和当前路由高亮（使用 `useLocation` 匹配）
- [x] 7.3 实现 TopBar 双模式适配：根据 `currentPage` 条件渲染 Office 模式内容（2D/3D 切换 + Agent 指标）或 Console 模式内容（「返回 Office」按钮 + 页面标题）

## 8. 管控页面骨架组件

- [x] 8.1 创建 `src/components/pages/DashboardPage.tsx`：页面标题 + 功能描述 + 空态提示
- [x] 8.2 创建 `src/components/pages/ChannelsPage.tsx`：页面标题 + 功能描述 + 空态提示
- [x] 8.3 创建 `src/components/pages/SkillsPage.tsx`：页面标题 + 功能描述 + 空态提示
- [x] 8.4 创建 `src/components/pages/CronPage.tsx`：页面标题 + 功能描述 + 空态提示
- [x] 8.5 创建 `src/components/pages/SettingsPage.tsx`：页面标题 + 功能描述 + 空态提示

## 9. 验收测试

- [x] 9.1 编写 Gateway Adapter 接口的单元测试：MockAdapter 返回数据结构验证、WsAdapter RPC 调用映射验证
- [x] 9.2 编写 Console Stores 的单元测试：各 store 的初始状态验证、action 调用验证
- [x] 9.3 手动验收：启动 dev server，验证所有路由可访问、TopBar 控制台菜单正常工作、页面切换不中断 Gateway 连接
- [x] 9.4 执行 `pnpm typecheck` 确认无类型错误
- [x] 9.5 执行 `pnpm test` 确认所有测试通过（AgentDot 3 个 pre-existing 失败不计入）
