import MockStableError, {
  overrideError,
  resetError,
} from './utils/mock-stable-error';
// @ember/test-waiters is still a v1 addon and is too weird
// to have in-repo types working correctly.
// @ts-ignore
import { _reset, getPendingWaiterState, waitFor } from '@ember/test-waiters';
import { module, test } from 'qunit';

import EmberObject from '@ember/object';
import { DEBUG } from '@glimmer/env';
import RSVP from 'rsvp';

// @ember/test-waiters is still a v1 addon and is too weird
// to have in-repo types working correctly.
// @ts-ignore
import { PromiseType, Thenable } from '@ember/test-waiters/types';

interface PromiseClassType<T> {
  new (resolve: (value: T) => T, ...args: any[]): PromiseType<T>;
}

interface PromiseDef {
  name: string;
  Promise: PromiseClassType<any>;
}

interface ModeDef {
  name: string;
  createPromise: Function;
  createThrowingPromise: Function;
}

if (DEBUG) {
  module('wait-for', function (hooks) {
    hooks.afterEach(function () {
      _reset();
      resetError();
    });

    const promiseImplementations: PromiseDef[] = [
      { name: 'Native Promise', Promise },
      { name: 'RSVP.Promise', Promise: RSVP.Promise },
    ];

    const promiseTestModules = promiseImplementations.map(
      ({ name, Promise }) => {
        class EmberObjectThing extends EmberObject.extend({
          doAsyncStuff: waitFor(async function doAsyncStuff(...args: any) {
            await new Promise((resolve) => {
              setTimeout(resolve, 10);
            });

            return args.reverse();
          }),

          asyncThrow: waitFor(async function asyncThrow() {
            await new Promise((resolve) => {
              setTimeout(resolve, 10);
            });
            throw new Error('doh!');
          }),
        }) {}

        class NativeThing {
          @waitFor
          async doAsyncStuff(...args: any) {
            await new Promise((resolve) => {
              setTimeout(resolve, 10);
            });
            return args.reverse();
          }

          @waitFor
          async asyncThrow() {
            await new Promise((resolve) => {
              setTimeout(resolve, 10);
            });
            throw new Error('doh!');
          }
        }
        return {
          name,
          waiterName: '@ember/test-waiters:promise-waiter',
          EmberObjectThing,
          NativeThing,
        };
      },
    );

    const testModules = [...promiseTestModules];

    testModules.forEach(
      ({ name, waiterName, EmberObjectThing, NativeThing }) => {
        module(name, function () {
          const invocationType = [
            {
              name: 'class function',
              createPromise(...args: any[]) {
                // @ts-expect-error classic object model is hard to type correctly
                return EmberObjectThing.create().doAsyncStuff(...args);
              },
              createThrowingPromise() {
                // @ts-expect-error classic object model is hard to type correctly
                return EmberObjectThing.create().asyncThrow();
              },
            },
            {
              name: 'decorator',
              createPromise(...args: any[]) {
                return new NativeThing().doAsyncStuff(...args);
              },
              createThrowingPromise() {
                return new NativeThing().asyncThrow();
              },
            },
          ];

          invocationType.forEach(
            ({ name, createPromise, createThrowingPromise }: ModeDef) => {
              module(name, function () {
                test('waitFor wraps and registers a waiter', async function (assert) {
                  overrideError(MockStableError);

                  const promise = createPromise();

                  assert.deepEqual(getPendingWaiterState(), {
                    pending: 1,
                    waiters: {
                      [waiterName]: [
                        {
                          label: undefined,
                          stack: 'STACK',
                        },
                      ],
                    },
                  });

                  await (
                    promise as unknown as Thenable<void, PromiseType<void>>
                  ).then(() => {
                    assert.deepEqual(getPendingWaiterState(), {
                      pending: 0,
                      waiters: {},
                    });
                  });
                });

                test('waitFor handles arguments and return value', async function (assert) {
                  overrideError(MockStableError);

                  const ret = await createPromise(1, 'foo');
                  assert.deepEqual(ret, ['foo', 1]);
                });

                test('waitFor transitions waiter to not pending even if promise throws when thenable wrapped', async function (assert) {
                  const promise = createThrowingPromise();

                  try {
                    await promise;
                  } catch (e) {
                    assert.deepEqual(getPendingWaiterState(), {
                      pending: 0,
                      waiters: {},
                    });
                  }
                });
              });
            },
          );
        });
      },
    );

    test('types', async function (assert) {
      assert.expect(0);

      async function asyncFn(a: string, b: string) {
        return `${a}${b}`;
      }
      function* genFn(a: string, b: string) {
        yield `${a}${b}`;
        return `${a}${b}`;
      }

      function asyncNoop(fn: typeof asyncFn) {
        return fn;
      }
      function genNoop(fn: typeof genFn) {
        return fn;
      }

      asyncNoop(waitFor(asyncFn));
      genNoop(waitFor(genFn));

      // @ts-expect-error wrong argument types
      waitFor(asyncFn)(1, 2);
      // @ts-expect-error wrong argument types
      waitFor(genFn)(1, 2);
    });
  });
}
