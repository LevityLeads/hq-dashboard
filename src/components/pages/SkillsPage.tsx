import { Puzzle } from "lucide-react";

export function SkillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Skills</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理技能与插件：安装、启停、配置
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
        <Puzzle className="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Skills 管理即将上线</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">等待 Phase C 实现完整功能</p>
      </div>
    </div>
  );
}
