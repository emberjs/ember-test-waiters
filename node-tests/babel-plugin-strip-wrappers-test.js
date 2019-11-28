const QUnit = require('qunit');
const StripWrappers = require('../babel-plugin-strip-wrappers');
const tmp = require('tmp');
const execa = require('execa');
const { readFileSync } = require('fs');
const path = require('path');

// Get ember-cli-babel's version of @babel/core
const emberCliBabelPath = require.resolve('ember-cli-babel');
const babelPath = require.resolve('@babel/core', {
  paths: [emberCliBabelPath],
});
const babel = require(babelPath);

const { test } = QUnit;

QUnit.module('babel-plugin-strip-wrappers', function() {
  function transform(code) {
    return babel.transform(code, {
      plugins: [[StripWrappers, { legacy: true }]],
    }).code;
  }

  test('strips waitForPromise()', function(assert) {
    let transformed = transform(
      [
        `import { waitForPromise } from 'ember-test-waiters';`,
        `function doAsync() {`,
        `  return waitForPromise(new Promise(resolve => resolve()));`,
        `}`,
      ].join('\n')
    );

    assert.equal(
      transformed,
      // prettier-ignore
      [
        `function doAsync() {`,
        `  return new Promise(resolve => resolve());`, `}`
      ].join('\n')
    );
  });

  test('strips @waitForPromise', function(assert) {
    let transformed = transform(
      [
        `import { waitForPromise } from 'ember-test-waiters';`,
        `class Foo {`,
        `  @waitForPromise`,
        `  async doAsync() {`,
        `    return new Promise(resolve => resolve());`,
        `  }`,
        ``,
        `}`,
      ].join('\n')
    );

    assert.equal(
      transformed,
      // prettier-ignore
      [
        `class Foo {`,
        `  async doAsync() {`,
        `    return new Promise(resolve => resolve());`,
        `  }`,
        ``,
        `}`,
      ].join('\n')
    );
  });

  test('does not strip other functions', function(assert) {
    let transformed = transform(
      [
        `import { waitForPromise, buildWaiter } from 'ember-test-waiters';`,
        ``,
        `function doAsync() {`,
        `  return waitForPromise(new Promise(resolve => resolve()));`,
        `}`,
        ``,
        `let waiter = buildWaiter('friend-waiter');`,
      ].join('\n')
    );

    assert.equal(
      transformed,
      // prettier-ignore
      [
        `import { buildWaiter } from 'ember-test-waiters';`,
        ``,
        `function doAsync() {`,
        `  return new Promise(resolve => resolve());`,
        `}`,
        ``,
        `let waiter = buildWaiter('friend-waiter');`,
      ].join('\n')
    );
  });

  test('plays nicely with decorators/class transforms', function(assert) {
    let input = [
      `import { waitForPromise } from 'ember-test-waiters';`,
      `class Foo {`,
      `  @waitForPromise`,
      `  async doAsync() {`,
      `    return new Promise(resolve => resolve());`,
      `  }`,
      ``,
      `}`,
    ].join('\n');

    let transformed = babel.transform(input, {
      plugins: [
        [StripWrappers, { legacy: true }],
        ['@babel/proposal-decorators', { legacy: true }],
        '@babel/transform-classes',
      ],
    }).code;

    assert.ok(transformed.includes('doAsync'));
  });

  test('end-to-end test', function(assert) {
    let tmpDir = tmp.dirSync().name;
    execa.sync('./node_modules/.bin/ember', ['build', '-prod', '-o', tmpDir], { stdio: 'inherit' });
    let contents = readFileSync(path.join(tmpDir, 'assets', 'dummy.js')).toString();
    assert.notOk(contents.includes('waitForPromise'));
  });
});
