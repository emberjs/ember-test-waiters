import { module, test } from 'qunit';
import { _reset, waitForPromise, getPendingWaiterState } from 'ember-test-waiters';
import RSVP from 'rsvp';
import MockStableError, { resetError, overrideError } from './utils/mock-stable-error';

module('wait-for-promise', function(hooks) {
  hooks.afterEach(function() {
    _reset();
    resetError();
  });

  test('wait-for-promise', async function(assert) {
    let promise: Promise<{}> = new RSVP.Promise(resolve => {
      resolve();
    });

    overrideError(MockStableError);

    promise = waitForPromise(promise);

    assert.deepEqual(getPendingWaiterState(), {
      pending: 1,
      waiters: {
        'promise-waiter': [
          {
            label: undefined,
            stack: 'STACK',
          },
        ],
      },
    });

    await promise.then(() => {
      assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
    });
  });
});
