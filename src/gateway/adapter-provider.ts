import type { GatewayAdapter } from "./adapter";

let adapterInstance: GatewayAdapter | null = null;

export function getAdapter(): GatewayAdapter {
  if (adapterInstance) return adapterInstance;
  throw new Error("GatewayAdapter not initialized. Call initAdapter() first.");
}

export async function initAdapter(
  mode: "mock" | "ws",
  deps?: { wsClient: unknown; rpcClient: unknown },
): Promise<GatewayAdapter> {
  if (adapterInstance) return adapterInstance;

  if (mode === "mock") {
    const { MockAdapter } = await import("./mock-adapter");
    adapterInstance = new MockAdapter();
  } else {
    if (!deps) throw new Error("WsAdapter requires wsClient and rpcClient");
    const { WsAdapter } = await import("./ws-adapter");
    const { GatewayWsClient } = await import("./ws-client");
    const { GatewayRpcClient } = await import("./rpc-client");

    if (!(deps.wsClient instanceof GatewayWsClient)) {
      throw new Error("Invalid wsClient");
    }
    if (!(deps.rpcClient instanceof GatewayRpcClient)) {
      throw new Error("Invalid rpcClient");
    }
    adapterInstance = new WsAdapter(deps.wsClient, deps.rpcClient);
  }

  await adapterInstance.connect();
  return adapterInstance;
}

export function isMockMode(): boolean {
  return import.meta.env.VITE_MOCK === "true";
}
