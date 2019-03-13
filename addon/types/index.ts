export type WaiterName = string;

export interface IWaiter {
  name: WaiterName;
  waitUntil(): boolean;
  debugInfo(): unknown[] | undefined | void;
}

export interface ISimpleWaiterDebugInfo {
  stack: string | undefined;
  label: string | undefined;
}

export interface IPendingWaiterState {
  pending: number;
  waiters: {
    [waiterName: string]: true | unknown[];
  };
}
