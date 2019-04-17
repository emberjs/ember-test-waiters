import { IWaiter, IPendingWaiterState } from './types';

const WAITERS = new Map();

/**
 * Registers a waiter.
 *
 * @public
 * @param waiter {IWaiter} A test waiter instance
 */
export function register(waiter: IWaiter): void {
  WAITERS.set(waiter.name, waiter);
}

/**
 * Unregisters a waiter.
 *
 * @public
 * @param waiter {IWaiter} A test waiter instance
 */
export function unregister(waiter: IWaiter): void {
  WAITERS.delete(waiter.name);
}

/**
 * Gets an array of all waiters current registered.
 *
 * @public
 * @returns {IWaiter[]}
 */
export function getWaiters(): IWaiter[] {
  return [...WAITERS.values()];
}

/**
 * Clears all waiters.
 *
 * @public
 */
export function _reset(): void {
  WAITERS.clear();
}

/**
 * Gets the current state of all waiters. Any waiters whose
 * `waitUntil` method returns false will be considered `pending`.
 *
 * @returns {IPendingWaiterState} An object containing a count of all waiters
 * pending and a `waiters` object containing the name of all pending waiters
 * and their debug info.
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
