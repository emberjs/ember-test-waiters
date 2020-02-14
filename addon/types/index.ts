import Token from '../token';

export type WaiterName = string;
export type Primitive = string | number | boolean | symbol | bigint;

export interface Waiter {
  name: WaiterName;
  waitUntil(): boolean;
  debugInfo(): TestWaiterDebugInfo[];
}

export interface TestWaiter<T extends object | Primitive = Token> extends Waiter {
  beginAsync(token?: T, label?: string): T;
  endAsync(token: T): void;
  reset(): void;
}

export interface TestWaiterDebugInfo {
  stack: string | undefined;
  label: string | undefined;
}

export interface PendingWaiterState {
  pending: number;
  waiters: {
    [waiterName: string]: TestWaiterDebugInfo[] | true;
  };
}
