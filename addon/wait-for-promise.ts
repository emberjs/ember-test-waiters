import { DEBUG } from '@glimmer/env';
import { Promise } from 'rsvp';
import buildWaiter from './build-waiter';

const PROMISE_WAITER = buildWaiter('promise-waiter');

/**
 * A convenient utility function to simplify waiting for a promise.
 *
 * @public
 * @param promise {Promise<T>} The promise to track async operations for
 * @param label {string} An optional string to identify the promise
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitForPromise } from 'ember-test-waiters';
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
export default function waitForPromise<T>(promise: Promise<T>, label?: string): Promise<T> {
  let result = promise;

  if (DEBUG) {
    PROMISE_WAITER.beginAsync(promise, label);

    result = promise.then(
      value => {
        PROMISE_WAITER.endAsync(promise);
        return value;
      },
      error => {
        PROMISE_WAITER.endAsync(promise);
        throw error;
      }
    );
  }

  return result;
}
