import { IWaiter, IPendingWaiterState } from './types';

const WAITERS = new Set();

/**
 * Registers a waiter with the test waiter manager.
 *
 * @public
 * @param waiter {IWaiter} A test waiter instance
 */
export function register(waiter: IWaiter): void {
  WAITERS.add(waiter);
}

/**
 * Unregisters a waiter with the test waiter manager.
 *
 * @public
 * @param waiter {IWaiter} A test waiter instance
 */
export function unregister(waiter: IWaiter): void {
  WAITERS.delete(waiter);
}

/**
 * Gets an array of all test waiters current registered.
 *
 * @public
 * @returns {IWaiter[]}
 */
export function getWaiters(): IWaiter[] {
  return [...WAITERS];
}

/**
 * Clears all test waiters from the waiter manager.
 *
 * @public
 */
export function reset(): void {
  WAITERS.clear();
}

/**
 * Gets the current state of all waiters. Any waiters whose
 * `waitUntil` method returns false will be considered `pending`.
 *
 * @returns a result object containing a count of all waiters pending and
 * a `waiters` object containing the name of all pending waiters and their
 * debug info.
 */
export function getPendingWaiterState(): IPendingWaiterState {
  let result: IPendingWaiterState = {
    pending: 0,
    waiters: {},
  };

  WAITERS.forEach(waiter => {
    if (!waiter.waitUntil()) {
      result.pending++;

      let debugInfo = waiter.debugInfo();
      result.waiters[waiter.name] = debugInfo || true;
    }
  });

  return result;
}

/**
 * Determines if there are any pending waiters.
 *
 * @returns {boolean} `true` if there are pending waiters, otherwise `false`.
 */
export function hasPendingWaiters(): boolean {
  let state = getPendingWaiterState();

  return state.pending > 0;
}
