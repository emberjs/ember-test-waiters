import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import { _reset, getPendingWaiterState, waitFor } from 'ember-test-waiters';
import { module, test } from 'qunit';

import EmberObject from '@ember/object';
import { DEBUG } from '@glimmer/env';
import RSVP from 'rsvp';

import { PromiseType, Thenable } from 'ember-test-waiters/types';

interface PromiseClassType<T> {
  new (resolve: (value: T) => T, ...args: any[]): PromiseType<T>;
}

interface PromiseDef {
  name: string;
  PromiseClass: PromiseClassType<any>;
}

interface ModeDef {
  name: string;
  createPromise: Function;
  createThrowingPromise: Function;
}

if (DEBUG) {
  module('wait-for', function(hooks) {
    hooks.afterEach(function() {
      _reset();
      resetError();
    });

    // We want to ensure we test against both RSVP and Native promises
    const promiseImpls: PromiseDef[] = [
      { name: 'Native Promise', PromiseClass: Promise },
      { name: 'RSVP.Promise', PromiseClass: RSVP.Promise },
    ];

    promiseImpls.forEach(({ name, PromiseClass }: PromiseDef) => {
      module(name, function() {
        class EmberObjectThing extends EmberObject.extend({
          doAsyncStuff: waitFor(async function doAsyncStuff(...args: any) {
            await new PromiseClass(resolve => {
              setTimeout(resolve, 10);
            });
            return Array.from(args).reverse();
          }),

          asyncThrow: waitFor(async function asyncThrow() {
            await new PromiseClass(resolve => {
              setTimeout(resolve, 10);
            });
            throw new Error('doh!');
          }),
        }) {}

        class NativeThing {
          @waitFor
          async doAsyncStuff(...args: any) {
            await new PromiseClass(resolve => {
              setTimeout(resolve, 10);
            });
            return Array.from(args).reverse();
          }

          @waitFor
          async asyncThrow() {
            await new PromiseClass(resolve => {
              setTimeout(resolve, 10);
            });
            throw new Error('doh!');
          }
        }

        const modes = [
          {
            // call an EmberObject class function that is wrapped in waitFor()
            name: 'class function',
            createPromise(...args: any[]) {
              return EmberObjectThing.create().doAsyncStuff(...args);
            },
            createThrowingPromise() {
              return EmberObjectThing.create().asyncThrow();
            },
          },
          {
            // call a native class function that is decorated with @waitFor
            name: 'decorator',
            createPromise(...args: any[]) {
              return new NativeThing().doAsyncStuff(...args);
            },
            createThrowingPromise() {
              return new NativeThing().asyncThrow();
            },
          },
        ];

        modes.forEach(({ name, createPromise, createThrowingPromise }: ModeDef) => {
          module(name, function() {
            test('waitFor wraps and registers a waiter', async function(assert) {
              overrideError(MockStableError);

              let promise = createPromise();

              assert.deepEqual(getPendingWaiterState(), {
                pending: 1,
                waiters: {
                  'ember-test-waiters:promise-waiter': [
                    {
                      label: undefined,
                      stack: 'STACK',
                    },
                  ],
                },
              });

              await ((promise as unknown) as Thenable<void, PromiseType<void>>).then(() => {
                assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
              });
            });

            test('waitFor handles arguments and return value', async function(assert) {
              overrideError(MockStableError);

              let ret = await createPromise(1, 'foo');
              assert.deepEqual(ret, ['foo', 1]);
            });

            test('waitFor transitions waiter to not pending even if promise throws when thenable wrapped', async function(assert) {
              let promise = createThrowingPromise();

              try {
                await promise;
              } catch (e) {
                assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
              }
            });
          });
        });
      });
    });
  });
}
