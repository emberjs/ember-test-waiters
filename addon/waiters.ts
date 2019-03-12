import { IWaiter, IPendingWaiterState } from './types';

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
