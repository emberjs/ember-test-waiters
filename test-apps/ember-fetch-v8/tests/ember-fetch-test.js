import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
// this is bad, because fetch is actually ember-fetch, and we didn't install "fetch"
import fetch from 'fetch';

module('ember-fetch@8', function (hooks) {
  setupTest(hooks);

  test('it waits for the fetch to be done', async function (assert) {
    const promise = fetch('test-file.json');

    assert.strictEqual(promise._state, undefined);
    assert.strictEqual(promise._result, undefined);
    await settled();
    assert.strictEqual(promise._state, 1);
    assert.strictEqual(promise._result?.statusText, 'OK');
  });
});
