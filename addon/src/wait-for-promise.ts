import { macroCondition, isDevelopingApp } from '@embroider/macros';
import buildWaiter from './build-waiter.ts';

import type { PromiseType, Thenable } from './types/index.ts';

const PROMISE_WAITER = buildWaiter('@ember/test-waiters:promise-waiter');

/**
 * A convenient utility function to simplify waiting for a promise.
 *
 * @public
 * @param promise {Promise<T> | RSVP.Promise<T>} The promise to track async operations for
 * @param label {string} An optional string to identify the promise
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitForPromise } from '@ember/test-waiters';
 *
 * export default class Friendz extends Component {
 *   didInsertElement() {
 *     waitForPromise(new Promise(resolve => {
 *       doSomeWork();
 *       resolve();
 *     }));
 *   }
 * }
 */
export default function waitForPromise<T, KindOfPromise extends PromiseType<T>>(
  promise: KindOfPromise,
  label?: string
): KindOfPromise {
  let result = promise;

  if (macroCondition(isDevelopingApp())) {
    PROMISE_WAITER.beginAsync(promise, label);

    result = (promise as unknown as Thenable<T, KindOfPromise>).then(
      (value: T) => {
        PROMISE_WAITER.endAsync(promise);
        return value;
      },
      (error: Error) => {
        PROMISE_WAITER.endAsync(promise);
        throw error;
      }
    );
  }

  return result;
}
