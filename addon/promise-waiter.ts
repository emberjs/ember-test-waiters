import { DEBUG } from '@glimmer/env';
import { IWaiter, ISimpleWaiterDebugInfo } from './types';

export class PromiseWaiter<T> implements IWaiter {
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
