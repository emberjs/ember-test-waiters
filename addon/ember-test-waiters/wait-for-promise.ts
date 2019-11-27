import { DEBUG } from '@glimmer/env';
import RSVP from 'rsvp';
import buildWaiter from './build-waiter';

const PROMISE_WAITER = buildWaiter('ember-test-waiters:promise-waiter');

type PromiseType<T> = Promise<T> | RSVP.Promise<T>;

interface Thenable<T, Return extends PromiseType<T>> {
  then(resolve: (value: T) => T, reject?: (error: Error) => T): Return;
}

/**
 * A convenient utility function to simplify waiting for a promise. Can be used
 * in both decorator and function form, and the function form either accepts a
 * promise or an async function.
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
 *
 * @public
 * @param promise {Function} An async function
 * @param label {string} An optional string to identify the promise
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitForPromise } from 'ember-test-waiters';
 *
 * export default Component.extend({
 *   doAsyncStuff: waitForPromise(async function doAsyncStuff() {
 *     await somethingAsync();
 *   }
 * });
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitForPromise } from 'ember-test-waiters';
 *
 * export default class Friendz extends Component {
 *   @waitForPromise
 *   async doAsyncStuff() {
 *     await somethingAsync();
 *   }
 * }
 *
 */
export default function waitForPromise(
  target: object,
  _key: string,
  descriptor: PropertyDescriptor,
  label?: string
): PropertyDescriptor;
export default function waitForPromise<T, KindOfPromise extends PromiseType<T>>(
  promise: KindOfPromise,
  label?: string
): KindOfPromise;
export default function waitForPromise<T, KindOfPromise extends PromiseType<T>>(
  fn: Function,
  label?: string
): Function;

export default function waitForPromise<T, KindOfPromise extends PromiseType<T>>(
  ...args:
    | [object, string, PropertyDescriptor, string?]
    | [KindOfPromise, string?]
    | [Function, string?]
): PropertyDescriptor | KindOfPromise | Function {
  let isFunctionalInvocation = args.length < 3;

  if (isFunctionalInvocation) {
    let isArgumentPromise = (args[0] as KindOfPromise).then;

    if (isArgumentPromise) {
      let [promise, label] = args as [KindOfPromise, string?];
      if (!DEBUG) {
        return promise;
      }

      return wait(promise, label);
    } else {
      // argument is async function
      let [fn, label] = args as [Function, string?];
      if (!DEBUG) {
        return fn;
      }

      return function(this: any, ...args: any[]) {
        let promise = fn.call(this, ...args);
        return wait(promise, label);
      };
    }
  } else {
    let [, , descriptor, label] = args as [object, string, PropertyDescriptor, string];
    if (DEBUG) {
      let fn = descriptor.value;
      descriptor.value = function(...args: any[]) {
        let promise = fn.call(this, ...args);
        return wait(promise, label);
      };
    }
    return descriptor;
  }
}

function wait<T, KindOfPromise extends PromiseType<T>>(promise: KindOfPromise, label?: string) {
  PROMISE_WAITER.beginAsync(promise, label);

  return ((promise as unknown) as Thenable<T, KindOfPromise>).then(
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
