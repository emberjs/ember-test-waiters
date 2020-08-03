import { DEBUG } from '@glimmer/env';
import waitForPromise from './wait-for-promise';

type AsyncFunction<A extends Array<any>, PromiseReturn> = (...args: A) => Promise<PromiseReturn>;
type AsyncFunctionArguments = [AsyncFunction<any[], any>, string?];
type DecoratorArguments = [object, string, PropertyDescriptor, string?];

/**
 * A convenient utility function to simplify waiting for async. Can be used
 * in both decorator and function form.
 *
 *
 * @public
 * @param promise {Function} An async function
 * @param label {string} An optional string to identify the promise
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitFor } from 'ember-test-waiters';
 *
 * export default Component.extend({
 *   doAsyncStuff: waitFor(async function doAsyncStuff() {
 *     await somethingAsync();
 *   }
 * });
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitFor } from 'ember-test-waiters';
 *
 * export default class Friendz extends Component {
 *   @waitFor
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
