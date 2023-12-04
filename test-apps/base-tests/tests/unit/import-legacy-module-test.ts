import { _reset, buildWaiter } from '@ember/test-waiters';
import { module, test } from 'qunit';

import { resetError } from './utils/mock-stable-error';

module('import-legacy-module', function (hooks) {
  hooks.afterEach(function () {
    _reset();
    resetError();
  });

  test('test waiter can be instantiated with a name', function (assert) {
    const name = 'my-waiter';
    const waiter = buildWaiter(name);

    assert.equal(waiter.name, name);
  });
});
