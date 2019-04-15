export type WaiterName = string;

export interface IWaiter {
  name: WaiterName;
  waitUntil(): boolean;
  debugInfo(): unknown;
}

export interface ITestWaiterDebugInfo {
  stack: string | undefined;
  label: string | undefined;
}

export interface IPendingWaiterState {
  pending: number;
  waiters: {
    [waiterName: string]: true | unknown[];
  };
}
