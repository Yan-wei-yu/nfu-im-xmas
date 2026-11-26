export type InitTask = readonly [name: string, run: () => void];
export type ErrorReporter = (name: string, error: unknown) => void;

const logError: ErrorReporter = (name, error) => {
  console.error(`[init] ${name} failed`, error);
};

/** 逐一啟動互動模組；一個壞掉不影響其他，回傳失敗的模組名稱 */
export function safeInit(tasks: readonly InitTask[], report: ErrorReporter = logError): string[] {
  const failed: string[] = [];
  for (const [name, run] of tasks) {
    try {
      run();
    } catch (error) {
      failed.push(name);
      report(name, error);
    }
  }
  return failed;
}
