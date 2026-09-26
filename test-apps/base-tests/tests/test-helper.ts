import Application from 'base-tests/app';
import config from 'base-tests/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

// ember-qunit 9 no longer loads tests in start(), ember-qunit 8 still does.
loadTests();
start({ loadTests: false });
