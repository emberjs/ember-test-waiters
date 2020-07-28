import { PendingWaiterState, Waiter } from './types';
/**
 * Registers a waiter.
 *
 * @public
 * @param waiter {Waiter} A test waiter instance
 */
export declare function register(waiter: Waiter): void;
/**
 * Un-registers a waiter.
 *
 * @public
 * @param waiter {Waiter} A test waiter instance
 */
export declare function unregister(waiter: Waiter): void;
/**
 * Gets an array of all waiters current registered.
 *
 * @public
 * @returns {Waiter[]}
 */
export declare function getWaiters(): Waiter[];
/**
 * Clears all waiters.
 *
 * @private
 */
export declare function _reset(): void;
/**
 * Gets the current state of all waiters. Any waiters whose
 * `waitUntil` method returns false will be considered `pending`.
 *
 * @returns {PendingWaiterState} An object containing a count of all waiters
 * pending and a `waiters` object containing the name of all pending waiters
 * and their debug info.
 */
export declare function getPendingWaiterState(): PendingWaiterState;
/**
 * Determines if there are any pending waiters.
 *
 * @returns {boolean} `true` if there are pending waiters, otherwise `false`.
 */
export declare function hasPendingWaiters(): boolean;
