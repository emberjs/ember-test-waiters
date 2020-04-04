## v2.0.1 (2020-04-04)

#### :bug: Bug Fix
* [#130](https://github.com/emberjs/ember-test-waiters/pull/130) Fix Type Errors ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* [#123](https://github.com/emberjs/ember-test-waiters/pull/123) Refactoring documentation. ([@scalvert](https://github.com/scalvert))

#### Committers: 3
- Preston Sego ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v2.0.0 (2020-02-26)

#### :boom: Breaking Change
* [#122](https://github.com/rwjblue/ember-test-waiters/pull/122) Update dependencies / devDependencies to latest. ([@rwjblue](https://github.com/rwjblue))
* [#95](https://github.com/rwjblue/ember-test-waiters/pull/95) Dropping support for node 8 ([@scalvert](https://github.com/scalvert))
* [#117](https://github.com/rwjblue/ember-test-waiters/pull/117) Rename interfaces, remove class exports. ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement
* [#112](https://github.com/rwjblue/ember-test-waiters/pull/112) Do not throw errors for endAsync being called multiple times ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix
* [#111](https://github.com/rwjblue/ember-test-waiters/pull/111) Fixes default tokens to be truthy ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#122](https://github.com/rwjblue/ember-test-waiters/pull/122) Update dependencies / devDependencies to latest. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v1.2.0 (2020-01-14)

#### :rocket: Enhancement

* task(TestWaiter): Add public API for clearing waiter items (dc15392)
* task(Build): Ensures that there can only be one active ember-test-waiters addon in builds (#86) (9ab9640)

#### :house: Internal

* task(release): Adding release-it configuration (68b7d54)
* task(CI): Refining when CI Build runs (8983354)
* Converting to use github actions (#88) (bee3c8c)
* task(README): Updating badges (#61) (873f7d5)
* task(deps): Pinning engine.io to specific version (d1121a7)
