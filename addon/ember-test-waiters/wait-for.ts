import { DEBUG } from '@glimmer/env';
import waitForPromise from './wait-for-promise';

type AsyncFunction<A extends Array<any>, PromiseReturn> = (...args: A) => Promise<PromiseReturn>;
type AsyncFunctionArguments = [AsyncFunction<any[], any>, string?];
type DecoratorArguments = [object, string, PropertyDescriptor, string?];

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
export default function waitFor(fn: AsyncFunction<any[], any>, label?: string): Function;
export default function waitFor(
  target: object,
  _key: string,
  descriptor: PropertyDescriptor,
  label?: string
): PropertyDescriptor;
export default function waitFor(
  ...args: AsyncFunctionArguments | DecoratorArguments
): PropertyDescriptor | Function {
  let isAsyncFunction = args.length < 3;

  if (isAsyncFunction) {
    // argument is async function
    let [fn, label] = args as AsyncFunctionArguments;

    if (!DEBUG) {
      return fn;
    }

    return function(this: any, ...args: any[]) {
      let promise = fn.call(this, ...args);

      return waitForPromise(promise, label);
    };
  } else {
    let [, , descriptor, label] = args as DecoratorArguments;

    if (!DEBUG) {
      return descriptor;
    }

    let fn = descriptor.value;

    descriptor.value = function(...args: any[]) {
      let promise = fn.call(this, ...args);
      return waitForPromise(promise, label);
    };

    return descriptor;
  }
}
