import { _reset, buildWaiter } from '@ember/test-waiters';
import { module, test } from 'qunit';

import { resetError } from './utils/mock-stable-error';

module('import-legacy-module', function (hooks) {
  hooks.afterEach(function () {
    _reset();
    resetError();
  });

  test('test waiter can be instantiated with a name', function (assert) {
    let name = 'my-waiter';
    let waiter = buildWaiter(name);

    assert.equal(waiter.name, name);
  });
});
