# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.1](https://github.com/Maronato/plausible-tracker/compare/v0.3.0...v0.3.1) (2020-11-09)


### Features

* **tracker:** add automatic outbound link tracking ([695152c](https://github.com/Maronato/plausible-tracker/commit/695152c70fcd3a5a2ed5f719ed5e4b104a4b37ec))

## [0.3.0](https://github.com/Maronato/plausible-tracker/compare/v0.2.2...v0.3.0) (2020-11-08)


### ⚠ BREAKING CHANGES

* **tracker:** `trackEvent`'s argument order was changed. `options` became the second argument and
`eventData` became the third.

### Features

* **request:** adds support for custom event properties ([2e4b8eb](https://github.com/Maronato/plausible-tracker/commit/2e4b8eb96aa2644caf4accd2148393c2552974fd)), closes [#2](https://github.com/Maronato/plausible-tracker/issues/2)
* **tracker:** trackEvent's EventOptions are now its second parameter ([13a5999](https://github.com/Maronato/plausible-tracker/commit/13a5999660935a3537fe1d2fb381d988777e812f))

### [0.2.2](https://github.com/Maronato/plausible-tracker/compare/v0.2.1...v0.2.2) (2020-10-15)

### [0.2.1](https://github.com/Maronato/plausible-tracker/compare/v0.2.0...v0.2.1) (2020-10-15)

## [0.2.0](https://github.com/Maronato/plausible-tracker/compare/v0.1.11...v0.2.0) (2020-10-15)


### ⚠ BREAKING CHANGES

* **tracker:** Removed `url`, `referrer` and `deviceWidth` from the type definitions of the
initialization function.
* **tracker:** `pageView()` becomes `trackPageview()` and `enableAutoPageViews()` becomes
`enableAutoPageviews()` Their type aliases names also changed, so `PageView` becomes `TrackPageview`
and `EnableAutoPageViews` becomes `EnableAutoPageviews`.

* **tracker:** "PageViews" are now a single word "pageview" ([892d8fe](https://github.com/Maronato/plausible-tracker/commit/892d8feb5941cc05c25f91b2e729e8676b9475c5))
* **tracker:** the initialization function now takes only a subset of all event options ([c7f1590](https://github.com/Maronato/plausible-tracker/commit/c7f1590101241961033000322c57e907dd55d51c))

### [0.1.11](https://github.com/Maronato/plausible-tracker/compare/v0.1.10...v0.1.11) (2020-10-12)

### [0.1.10](https://github.com/Maronato/plausible-tracker/compare/v0.1.9...v0.1.10) (2020-10-12)

### [0.1.9](https://github.com/Maronato/plausible-tracker/compare/v0.1.8...v0.1.9) (2020-10-12)

### [0.1.8](https://github.com/Maronato/plausible-tracker/compare/v0.1.7...v0.1.8) (2020-10-12)

### [0.1.7](https://github.com/Maronato/plausible-tracker/compare/v0.1.6...v0.1.7) (2020-10-12)


### Bug Fixes

* **tracker:** remove typescript-only '?' notation because it was not being transpiled properly ([594796f](https://github.com/Maronato/plausible-tracker/commit/594796fb0a4109e5494c2ae91cd875f06202c36b))

### [0.1.6](https://github.com/Maronato/plausible-tracker/compare/v0.1.5...v0.1.6) (2020-10-12)

### [0.1.5](https://github.com/Maronato/plausible-tracker/compare/v0.1.4...v0.1.5) (2020-10-12)


### Bug Fixes

* **docs:** fixed some typos ([dbe0a2c](https://github.com/Maronato/plausible-tracker/commit/dbe0a2cea15dbd87fd13f76ac51a2ede25c632ad))

### [0.1.4](https://github.com/Maronato/plausible-tracker/compare/v0.1.3...v0.1.4) (2020-10-12)

### [0.1.3](https://github.com/Maronato/plausible-tracker/compare/v0.1.2...v0.1.3) (2020-10-12)


### Bug Fixes

* **cspell:** added "GIFs" to cspell ([58ce3cf](https://github.com/Maronato/plausible-tracker/commit/58ce3cf88951bb778056b8c0b2d2840b0ead5610))

### 0.1.2 (2020-10-12)
Initial release
