import Token from '../token';

export type WaiterName = string;
export type Primitive = string | number | boolean | symbol | bigint;

export interface IWaiter {
  name: WaiterName;
  waitUntil(): boolean;
  debugInfo(): ITestWaiterDebugInfo[];
}

export interface ITestWaiter<T extends object | Primitive = Token> extends IWaiter {
  beginAsync(token?: T, label?: string): T;
  endAsync(token: T): void;
  reset(): void;
}

export interface ITestWaiterDebugInfo {
  stack: string | undefined;
  label: string | undefined;
}

export interface IPendingWaiterState {
  pending: number;
  waiters: {
    [waiterName: string]: ITestWaiterDebugInfo[] | true;
  };
}
