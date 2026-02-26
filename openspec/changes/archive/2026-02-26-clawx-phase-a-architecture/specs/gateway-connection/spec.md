## MODIFIED Requirements

### Requirement: 事件分发

系统 SHALL 将收到的 Gateway 事件帧分发到 Zustand store。新增 Adapter 层后，事件分发 SHALL 同时支持直接 WebSocket 订阅和 Adapter 事件回调两种模式。

#### Scenario: 收到 agent 事件

- **WHEN** 收到 `{ type: "event", event: "agent", payload: AgentEventPayload }`
- **THEN** 系统 SHALL 将 payload 推入事件队列，由事件处理模块异步处理

#### Scenario: 收到 presence 事件

- **WHEN** 收到 `{ type: "event", event: "presence", payload }`
- **THEN** 系统 SHALL 更新 store 中的 presence 数据

#### Scenario: 收到 shutdown 事件

- **WHEN** 收到 `{ type: "event", event: "shutdown", payload: { reason } }`
- **THEN** 系统 SHALL 停止自动重连，TopBar 显示 "Gateway 已关闭: {reason}"

#### Scenario: 通过 Adapter onEvent 回调接收事件

- **WHEN** 使用 GatewayAdapter 的 `onEvent()` 方法订阅事件
- **THEN** Adapter SHALL 将 WebSocket 事件帧解包后通过回调分发，回调签名为 `(event: string, payload: unknown) => void`，使 store 层不直接依赖 WebSocket 客户端
