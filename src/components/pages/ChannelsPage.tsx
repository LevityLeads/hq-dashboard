import { Radio } from "lucide-react";

export function ChannelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Channels</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理消息渠道：Telegram、Discord、WhatsApp 等
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
        <Radio className="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Channels 管理即将上线</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">等待 Phase C 实现完整功能</p>
      </div>
    </div>
  );
}
