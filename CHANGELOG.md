# Changelog

## Release (2025-07-05)

@ember/test-waiters 4.1.1 (patch)

#### :bug: Bug Fix
* `@ember/test-waiters`
  * [#519](https://github.com/emberjs/ember-test-waiters/pull/519) fix: proxy more parts of fetch Response ([@Techn1x](https://github.com/Techn1x))

#### :memo: Documentation
* [#516](https://github.com/emberjs/ember-test-waiters/pull/516) Update README.md for waitForFetch ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 2
- Brad Overton ([@Techn1x](https://github.com/Techn1x))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-03-11)

@ember/test-waiters 4.1.0 (minor)

#### :rocket: Enhancement
* `@ember/test-waiters`, `base-tests`
  * [#513](https://github.com/emberjs/ember-test-waiters/pull/513) Implement functionally for "deprecate fetch" RFC ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-12-05)

@ember/test-waiters 4.0.0 (major)

#### :boom: Breaking Change
* `@ember/test-waiters`, `base-tests`, `ember-fetch-v8`
  * [#476](https://github.com/emberjs/ember-test-waiters/pull/476) Convert to V2 Addon, drop support for ember-source < v4 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#463](https://github.com/emberjs/ember-test-waiters/pull/463) move tests to base-tests app, drop support for 3.8, 3.12, 0.x embroider, and ember-classic ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `@ember/test-waiters`
  * [#500](https://github.com/emberjs/ember-test-waiters/pull/500) Drop support for ember-concurrency@v2 (ember-concurrency is on @v4 now anyway) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#477](https://github.com/emberjs/ember-test-waiters/pull/477) Drop support legacy waiter system ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#475](https://github.com/emberjs/ember-test-waiters/pull/475) Drop support for the 'global' global. Every supported environment has `globalThis` ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#454](https://github.com/emberjs/ember-test-waiters/pull/454) Remove dual-package emit ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#453](https://github.com/emberjs/ember-test-waiters/pull/453) Require ember-auto-import@v2 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#455](https://github.com/emberjs/ember-test-waiters/pull/455) Upgrade CI / re-roll lockfile ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :rocket: Enhancement
* `@ember/test-waiters`, `base-tests`, `ember-fetch-v8`
  * [#476](https://github.com/emberjs/ember-test-waiters/pull/476) Convert to V2 Addon, drop support for ember-source < v4 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `@ember/test-waiters`, `base-tests`
  * [#508](https://github.com/emberjs/ember-test-waiters/pull/508) Remove @glimmer/env in favor of @embroider/macros ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `@ember/test-waiters`
  * [#474](https://github.com/emberjs/ember-test-waiters/pull/474) Drop support for Typescript < 4.9 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#459](https://github.com/emberjs/ember-test-waiters/pull/459) Improve waitFor() types ([@bendemboski](https://github.com/bendemboski))
* `base-tests`
  * [#466](https://github.com/emberjs/ember-test-waiters/pull/466) Add support for 3.28, 4.12, 5.4 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `@ember/test-waiters`
  * [#467](https://github.com/emberjs/ember-test-waiters/pull/467) Update to `ember-cli-babel` v8 ([@bertdeblock](https://github.com/bertdeblock))

#### :house: Internal
* Other
  * [#510](https://github.com/emberjs/ember-test-waiters/pull/510) Move LICENSE and README to repo root ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#505](https://github.com/emberjs/ember-test-waiters/pull/505) Update release-plan ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#503](https://github.com/emberjs/ember-test-waiters/pull/503) Upgrade pnpm (v9) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#472](https://github.com/emberjs/ember-test-waiters/pull/472) Remove extraneous test-app (for ember-concurrency@v3) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#469](https://github.com/emberjs/ember-test-waiters/pull/469) Enable manual CI running ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#456](https://github.com/emberjs/ember-test-waiters/pull/456) Remove IE11 from targets as the browser is not supported anymore ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `base-tests`
  * [#509](https://github.com/emberjs/ember-test-waiters/pull/509) Expand try-matrix to expected current support (keeping 3.16+) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `@ember/test-waiters`, `base-tests`, `ember-fetch-v8`
  * [#507](https://github.com/emberjs/ember-test-waiters/pull/507) Update build dependencies ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#506](https://github.com/emberjs/ember-test-waiters/pull/506) Update lint dependencies ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#483](https://github.com/emberjs/ember-test-waiters/pull/483) Setup formatting enforcement ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#482](https://github.com/emberjs/ember-test-waiters/pull/482) Setup local volta configs ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#473](https://github.com/emberjs/ember-test-waiters/pull/473) Drop support for TS < v5 -- Setup CI for type-checking all test apps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#464](https://github.com/emberjs/ember-test-waiters/pull/464) Move ember-concurrency-specific-tests to the ember-concurrency@v2 test-app ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `base-tests`, `ember-fetch-v8`
  * [#504](https://github.com/emberjs/ember-test-waiters/pull/504) Remove stylelint ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#478](https://github.com/emberjs/ember-test-waiters/pull/478) Remove ember-data from dev-dependencies ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#479](https://github.com/emberjs/ember-test-waiters/pull/479) Test against embroider ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#460](https://github.com/emberjs/ember-test-waiters/pull/460) Add 4 empty test apps (all boilerplate) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-fetch-v8`
  * [#471](https://github.com/emberjs/ember-test-waiters/pull/471) Add test to prove ember-fetch@8 works with the current test-waiter system/integration ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `@ember/test-waiters`
  * [#468](https://github.com/emberjs/ember-test-waiters/pull/468) Setup release plan ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#452](https://github.com/emberjs/ember-test-waiters/pull/452) v2 Addon prep: move everything in to a single package monorepo ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 3
- Ben Demboski ([@bendemboski](https://github.com/bendemboski))
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## v3.0.2 (2022-04-26)

#### :rocket: Enhancement
* [#377](https://github.com/emberjs/ember-test-waiters/pull/377) Adding more descriptive error message for unpaired endAsync calls ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix
* [#388](https://github.com/emberjs/ember-test-waiters/pull/388) Ensure waiters are discovered even if multiple versions exist ([@rwjblue](https://github.com/rwjblue))
* [#376](https://github.com/emberjs/ember-test-waiters/pull/376) Fixes build issue with floating dependencies in CI ([@scalvert](https://github.com/scalvert))
* [#358](https://github.com/emberjs/ember-test-waiters/pull/358) Moving ember-cli-typescript to dependencies ([@scalvert](https://github.com/scalvert))
* [#357](https://github.com/emberjs/ember-test-waiters/pull/357) Avoid unreachable code after return warning ([@sandstrom](https://github.com/sandstrom))

#### :memo: Documentation
* [#387](https://github.com/emberjs/ember-test-waiters/pull/387) Migrate examples in the README.md to use async/await ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#381](https://github.com/emberjs/ember-test-waiters/pull/381) Migrate from Yarn@1 to NPM ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@sandstrom](https://github.com/sandstrom)


## v3.0.1 (2022-01-06)

#### :bug: Bug Fix
* [#350](https://github.com/emberjs/ember-test-waiters/pull/350) Fixes main entry point in package.json to point to built .js file ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#355](https://github.com/emberjs/ember-test-waiters/pull/355) Running `npx browserlist@latest --update-db` ([@scalvert](https://github.com/scalvert))
* [#340](https://github.com/emberjs/ember-test-waiters/pull/340) Updates ember-try scenarios to work with ember-auto-import@2 ([@scalvert](https://github.com/scalvert))
* [#313](https://github.com/emberjs/ember-test-waiters/pull/313) add ember-lts-3.24 scenario ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 3
- Andrey Mikhaylov (lolmaus) ([@lolmaus](https://github.com/lolmaus))
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v3.0.0 (2021-08-18)

#### :house: Internal
* [#312](https://github.com/emberjs/ember-test-waiters/pull/312) ensure `npm pack` is tidy ([@stefanpenner](https://github.com/stefanpenner))
* [#308](https://github.com/emberjs/ember-test-waiters/pull/308) embroider ember-try scenarios ([@stefanpenner](https://github.com/stefanpenner))
* [#293](https://github.com/emberjs/ember-test-waiters/pull/293) Updates publish step to publish JavaScript + *.d.ts vs. .ts files. ([@stefanpenner](https://github.com/stefanpenner))
* [#306](https://github.com/emberjs/ember-test-waiters/pull/306) Fix Failing Tests resulting from ember-concurrency v2 bump ([@stefanpenner](https://github.com/stefanpenner))
* [#297](https://github.com/emberjs/ember-test-waiters/pull/297) Fix canary ([@stefanpenner](https://github.com/stefanpenner))
* [#292](https://github.com/emberjs/ember-test-waiters/pull/292) Updating .npmignore to remove unneeded files from publish ([@scalvert](https://github.com/scalvert))
* [#295](https://github.com/emberjs/ember-test-waiters/pull/295) Migrate to using pre/postpack ([@scalvert](https://github.com/scalvert))
* [#294](https://github.com/emberjs/ember-test-waiters/pull/294) no longer fail fast on try-scenarios ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 2
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v2.4.5 (2021-07-13)

#### :bug: Bug Fix
* [#280](https://github.com/emberjs/ember-test-waiters/pull/280) Fixes TS issue with mismatched type for deprecate ([@scalvert](https://github.com/scalvert))
* [#272](https://github.com/emberjs/ember-test-waiters/pull/272) Fix warnings when the legacy module deprecation is triggered ([@sandydoo](https://github.com/sandydoo))

#### :house: Internal
* [#285](https://github.com/emberjs/ember-test-waiters/pull/285) Running npx browserslist@latest --update-db ([@scalvert](https://github.com/scalvert))
* [#279](https://github.com/emberjs/ember-test-waiters/pull/279) Adds type checking to CI ([@scalvert](https://github.com/scalvert))
* [#270](https://github.com/emberjs/ember-test-waiters/pull/270) Adding octane edition to package.json ([@scalvert](https://github.com/scalvert))

#### Committers: 3
- Luke Melia ([@lukemelia](https://github.com/lukemelia))
- Sander Melnikov ([@sandydoo](https://github.com/sandydoo))
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v2.4.4 (2021-05-14)

#### :bug: Bug Fix
* [#254](https://github.com/emberjs/ember-test-waiters/pull/254) Flip the logic for deprecation of old package name ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


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
