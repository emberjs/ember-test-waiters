import { DEBUG } from '@glimmer/env';
import waitForPromise from './wait-for-promise';
import { PromiseType } from './types';

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

    return wrapFunction(fn, label);
  } else {
    let [, , descriptor, label] = args as DecoratorArguments;

    if (!DEBUG) {
      return descriptor;
    }

    let fn = descriptor.value;

    descriptor.value = wrapFunction(fn, label);

    return descriptor;
  }
}

function wrapFunction(fn: Function, label?: string) {
  if (!DEBUG) {
    return fn;
  }

  return function(this: any, ...args: any[]) {
    let result = fn.call(this, ...args);

    if (isThenable(result)) {
      return waitForPromise(result, label);
    } else {
      return result;
    }
  };
}

function isThenable(
  maybePromise: any | PromiseType<unknown>
): maybePromise is PromiseType<unknown> {
  let type = typeof maybePromise;

  return (
    ((maybePromise !== null && type === 'object') || type === 'function') &&
    typeof maybePromise.then === 'function'
  );
}
