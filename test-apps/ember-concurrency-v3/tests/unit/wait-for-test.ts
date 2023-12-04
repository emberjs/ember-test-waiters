import MockStableError, {
  overrideError,
  resetError,
} from './utils/mock-stable-error';
// @ember/test-waiters is still a v1 addon and is too weird
// to have in-repo types working correctly.
// @ts-ignore
import { _reset, getPendingWaiterState, waitFor } from '@ember/test-waiters';
import { module, test } from 'qunit';
import { get } from '@ember/object';

import { DEBUG } from '@glimmer/env';

import { task, didCancel } from 'ember-concurrency';

// @ember/test-waiters is still a v1 addon and is too weird
// to have in-repo types working correctly.
// @ts-ignore
import { PromiseType, Thenable } from '@ember/test-waiters/types';

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
    const generatorTestModules = [
      (function () {
        class NativeThing {
          @waitFor
          doStuffTask = task(async (...args: any) => {
            await new Promise((resolve) => {
              setTimeout(resolve, 10);
            });
            return args.reverse();
          });

          doAsyncStuff(...args: any) {
            return this.doStuffTask.perform(...args);
          }

          @waitFor
          throwingTask = task(async () => {
            await new Promise((resolve) => {
              setTimeout(resolve, 10);
            });
            throw new Error('doh!');
          });
          asyncThrow() {
            return this.throwingTask.perform();
          }
        }

        return {
          name: 'Generator',
          waiterName: '@ember/test-waiters:generator-waiter',
          NativeThing,
        };
      })(),
    ];

    const testModules = [...generatorTestModules];

    testModules.forEach(({ name, waiterName, NativeThing }) => {
      module(name, function () {
        const invocationType = [
          {
            name: 'class usage',
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
    });

    module('waitFor ember-concurrency interop', function () {
      class Deferred {
        promise: Promise<any>;
        resolve: Function = () => null;

        constructor() {
          this.promise = new Promise((res) => (this.resolve = res));
        }
      }

      class NativeThing {
        iterations: Array<number> = [];
        _continue?: Function;

        @waitFor
        doStuffTask = task(async () => {
          for (let i = 0; i < 3; i += 1) {
            const continuation = new Deferred();
            if (this._continue !== undefined) {
              throw new Error('pending continue, cannot proceed');
            }
            const completion = new Deferred();
            let complete = false;

            this._continue = () => {
              if (complete === true) {
                throw new Error(
                  'Cannot call continue twice on a single iteration',
                );
              } else {
                complete = true;
              }

              continuation.resolve();
              return completion.promise;
            };

            try {
              await continuation.promise;
            } finally {
              this._continue = undefined;
              completion.resolve();
            }
            this.iterations.push(i);
          }
          return 'done';
        });

        get continue() {
          if (this._continue === undefined) {
            throw new Error('Cannot call continue twice on a single iteration');
          } else {
            try {
              return this._continue;
            } finally {
              // detect invalid usage. Specifically, our test (as written
              // currently) would be in-error if any given continue() is invoked more
              // then once
              this._continue = undefined;
            }
          }
        }

        parentTask = task(async () => {
          return await this.doStuffTask.perform();
        });

        @waitFor
        wrappedParentTask = task(async () => {
          return await this.doStuffTask.perform();
        });
      }

      test('tasks with multiple yields work', async function (assert) {
        const thing = new NativeThing();
        const task = thing.doStuffTask.perform();

        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        assert.deepEqual(thing.iterations, [0]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        assert.deepEqual(thing.iterations, [0, 1]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        await task;

        assert.deepEqual(thing.iterations, [0, 1, 2]);
        assert.deepEqual(getPendingWaiterState().pending, 0);
      });

      interface CancellationDef {
        desc: string;
        taskName: 'doStuffTask' | 'parentTask' | 'wrappedParentTask';
      }

      const cancellationCases: CancellationDef[] = [
        { desc: 'direct', taskName: 'doStuffTask' },
        { desc: 'parent', taskName: 'parentTask' },
        { desc: 'wrapped parent', taskName: 'wrappedParentTask' },
      ];

      cancellationCases.forEach(({ desc, taskName }) => {
        test(`${desc} task cancellation works`, async function (assert) {
          const thing = new NativeThing();

          const instance = get(thing, taskName).perform();
          assert.deepEqual(getPendingWaiterState().pending, 1);

          await thing.continue();
          assert.deepEqual(thing.iterations, [0]);
          assert.deepEqual(getPendingWaiterState().pending, 1);

          instance.cancel();
          try {
            await instance;
            assert.ok(false);
          } catch (e) {
            assert.ok(didCancel(e));
            assert.deepEqual(getPendingWaiterState().pending, 0);
          }
        });
      });
    });
  });
}
