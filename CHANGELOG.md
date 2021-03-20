## v2.4.3 (2021-03-20)

#### :bug: Bug Fix
* [#242](https://github.com/emberjs/ember-test-waiters/pull/242) Update to ember-cli-babel@7.26.2 to fix window.Ember deprecations ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.4.2 (2021-03-11)

#### :bug: Bug Fix
* [#239](https://github.com/emberjs/ember-test-waiters/pull/239) Use `export type` to avoid broken imports when types are transpiled away ([@ef4](https://github.com/ef4))

#### Committers: 2
- Edward Faulkner ([@ef4](https://github.com/ef4))


## v2.4.1 (2021-02-25)

#### :bug: Bug Fix
* [#232](https://github.com/emberjs/ember-test-waiters/pull/232) Fix leak of tokens during development builds ([@bendemboski](https://github.com/bendemboski))

#### Committers: 1
- Ben Demboski ([@bendemboski](https://github.com/bendemboski))


## v2.4.0 (2021-02-12)

#### :rocket: Enhancement
* [#231](https://github.com/emberjs/ember-test-waiters/pull/231) Update `cacheKeyForTree` override to account for both addon names ([@brendenpalmer](https://github.com/brendenpalmer))

#### :house: Internal
* [#221](https://github.com/emberjs/ember-test-waiters/pull/221) Update to released version of ember-concurrency-decorators. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3
- Brenden Palmer ([@brendenpalmer](https://github.com/brendenpalmer))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.3.2 (2020-12-04)

#### :bug: Bug Fix
* [#213](https://github.com/emberjs/ember-test-waiters/pull/213) Fix IE11 compatiblity ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.3.1 (2020-11-30)

#### :bug: Bug Fix
* [#202](https://github.com/emberjs/ember-test-waiters/pull/202) Update highlander logic to be compatible with `ember-engines` ([@brendenpalmer](https://github.com/brendenpalmer))

#### :house: Internal
* [#204](https://github.com/emberjs/ember-test-waiters/pull/204) Ensure prereleases are used when present. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3
- Brenden Palmer ([@brendenpalmer](https://github.com/brendenpalmer))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.3.0 (2020-10-28)

#### :rocket: Enhancement
* [#173](https://github.com/emberjs/ember-test-waiters/pull/173) feat(wait-for) support coroutines/generators ([@bendemboski](https://github.com/bendemboski))

#### :house: Internal
* [#195](https://github.com/emberjs/ember-test-waiters/pull/195) Fix CI build ([@bendemboski](https://github.com/bendemboski))

#### Committers: 3
- Ben Demboski ([@bendemboski](https://github.com/bendemboski))
- Thomas Wang ([@xg-wang](https://github.com/xg-wang))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.2.0 (2020-08-17)

#### :boom: Breaking Change
* [#176](https://github.com/emberjs/ember-test-waiters/pull/176) Drop Node 13 support. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#150](https://github.com/emberjs/ember-test-waiters/pull/150) Converting published package name to @ember/test-waiters ([@scalvert](https://github.com/scalvert))
* [#131](https://github.com/emberjs/ember-test-waiters/pull/131) Add waitFor function to enable waiting for async functions ([@bendemboski](https://github.com/bendemboski))

#### :house: Internal
* [#178](https://github.com/emberjs/ember-test-waiters/pull/178) Update automated release setup. ([@rwjblue](https://github.com/rwjblue))
* [#177](https://github.com/emberjs/ember-test-waiters/pull/177) Update package.json addon contributors & description. ([@rwjblue](https://github.com/rwjblue))
* [#171](https://github.com/emberjs/ember-test-waiters/pull/171) Add Ember 3.16 and 3.20 to CI ([@rwjblue](https://github.com/rwjblue))

#### Committers: 4
- Ben Demboski ([@bendemboski](https://github.com/bendemboski))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.1.3 (2020-07-28)

#### :bug: Bug Fix
* [#165](https://github.com/emberjs/ember-test-waiters/pull/165) Fixes incorrectly nested exports for users of ember-cli < 3.13.x ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v2.1.2 (2020-06-04)

#### :bug: Bug Fix
* [#156](https://github.com/emberjs/ember-test-waiters/pull/156) Updating paths for types in package.json ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v2.1.1 (2020-05-19)

#### :bug: Bug Fix
* [#148](https://github.com/emberjs/ember-test-waiters/pull/148) Inverting module export locations for multi-module publishing ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v2.1.0 (2020-05-13)

#### :rocket: Enhancement
* [#133](https://github.com/emberjs/ember-test-waiters/pull/133) Expose `@ember/test-waiters` in addition to `ember-test-waiters` module names ([@scalvert](https://github.com/scalvert))
* [#126](https://github.com/emberjs/ember-test-waiters/pull/126) Adding constraints around naming test waiters ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix
* [#141](https://github.com/emberjs/ember-test-waiters/pull/141) Updating index in legacy module to correctly publish index.d.ts ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation
* [#126](https://github.com/emberjs/ember-test-waiters/pull/126) Adding constraints around naming test waiters ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#135](https://github.com/emberjs/ember-test-waiters/pull/135) Switch to using `ember-cli-version-checker` for gathering addons ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v2.1.0 (2020-05-13)

#### :rocket: Enhancement
* [#133](https://github.com/emberjs/ember-test-waiters/pull/133) Expose `@ember/test-waiters` in addition to `ember-test-waiters` module names ([@scalvert](https://github.com/scalvert))
* [#126](https://github.com/emberjs/ember-test-waiters/pull/126) Adding constraints around naming test waiters ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation
* [#126](https://github.com/emberjs/ember-test-waiters/pull/126) Adding constraints around naming test waiters ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#135](https://github.com/emberjs/ember-test-waiters/pull/135) Switch to using `ember-cli-version-checker` for gathering addons ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))

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
