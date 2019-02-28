import { DEBUG } from '@glimmer/env';

type WaiterName = string;

export interface IWaiter {
  name: WaiterName;
  waitUntil(): boolean;
  debugInfo(): unknown[] | undefined | void;
}

export interface ISimpleWaiterDebugInfo {
  stack: string | undefined;
  label: string | undefined;
}

export class SimpleWaiter<T> implements IWaiter {
  public name: WaiterName;

  items = new Map<unknown, ISimpleWaiterDebugInfo>();

  constructor(name: WaiterName) {
    this.name = name;
  }

  add(item: T, label: string) {
    this.items.set(item, {
      stack: new Error().stack,
      label,
    });
  }

  delete(item: T) {
    this.items.delete(item);
  }

  waitUntil() {
    return this.items.size === 0;
  }

  debugInfo(): ISimpleWaiterDebugInfo[] {
    let output: ISimpleWaiterDebugInfo[] = [];

    this.items.forEach(item => output.push(item));

    return output;
  }
}

class PromiseWaiter<T> implements IWaiter {
  name = 'promise-waiter';
  items = new Map<Promise<T>, ISimpleWaiterDebugInfo>();

  add(promise: Promise<T>, label?: string) {
    this.items.set(promise, {
      stack: new Error().stack,
      label,
    });
  }

  delete(promise: Promise<T>) {
    this.items.delete(promise);
  }

  waitUntil(): boolean {
    return this.items.size === 0;
  }

  debugInfo(): ISimpleWaiterDebugInfo[] {
    let output: ISimpleWaiterDebugInfo[] = [];

    this.items.forEach(item => output.push(item));

    return output;
  }
}

const PROMISE_WAITER = new PromiseWaiter();
export function waitForPromise<T>(promise: Promise<T>, label?: string) {
  let result = promise;

  if (DEBUG) {
    PROMISE_WAITER.add(promise, label);

    result = promise.then(
      value => {
        PROMISE_WAITER.delete(promise);
        return value;
      },
      error => {
        PROMISE_WAITER.delete(promise);
        throw error;
      }
    );
  }

  return result;
}

const WAITERS = new Set();

export function register(waiter: IWaiter) {
  WAITERS.add(waiter);
}

export function unregister(waiter: IWaiter) {
  WAITERS.delete(waiter);
}

export function getWaiters(): IWaiter[] {
  let result: IWaiter[] = [];

  WAITERS.forEach(item => result.push(item));

  return result;
}

export function reset() {
  WAITERS.clear();
}

interface IPendingWaiterState {
  pending: number;
  waiters: {
    [waiterName: string]: true | unknown[];
  };
}

export function getPendingWaiterState(): IPendingWaiterState {
  let result: IPendingWaiterState = {
    pending: 0,
    waiters: {},
  };

  WAITERS.forEach(waiter => {
    if (waiter.waitUntil()) {
      result.pending++;

      let debugInfo = waiter.debugInfo();
      result.waiters[waiter.name] = debugInfo || true;
    }
  });

  return result;
}

export function shouldWait(): boolean {
  let state = getPendingWaiterState();

  return state.pending > 0;
}
