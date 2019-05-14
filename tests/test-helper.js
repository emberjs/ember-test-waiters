import QUnit from 'qunit';
import AbstractTestLoader from 'ember-cli-test-loader/test-support/index';

let moduleLoadFailures = [];

QUnit.done(function() {
  if (moduleLoadFailures.length) {
    throw new Error('\n' + moduleLoadFailures.join('\n'));
  }
});

class TestLoader extends AbstractTestLoader {
  moduleLoadFailure(moduleName, error) {
    moduleLoadFailures.push(error);

    QUnit.module('TestLoader Failures');
    QUnit.test(moduleName + ': could not be loaded', function() {
      throw error;
    });
  }
}

new TestLoader().loadModules();

QUnit.testDone(function() {
  let testElementContainer = document.getElementById('ember-testing-container');
  let testElementReset = testElementContainer.outerHTML;
  testElementContainer.innerHTML = testElementReset;
});
