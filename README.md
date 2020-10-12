# Plausible Analytics Tracker

[![NPM](https://flat.badgen.net/npm/v/plausible-tracker)](https://www.npmjs.com/package/plausible-tracker)  [![Bundle](https://flat.badgen.net/bundlephobia/minzip/plausible-tracker)](https://bundlephobia.com/result?p=plausible-tracker@latest)

[![Build Status](https://travis-ci.com/Maronato/plausible-tracker.svg?branch=master)](https://travis-ci.com/Maronato/plausible-tracker) [![codecov](https://codecov.io/gh/Maronato/plausible-tracker/branch/master/graph/badge.svg)](https://codecov.io/gh/Maronato/plausible-tracker)


[![dependencies Status](https://david-dm.org/maronato/plausible-tracker/status.svg)](https://david-dm.org/maronato/plausible-tracker) [![devDependencies Status](https://david-dm.org/maronato/plausible-tracker/dev-status.svg)](https://david-dm.org/maronato/plausible-tracker?type=dev)

Unofficial frontend library to interact with [Plausible Analytics](https://plausible.io/).

- [Plausible Analytics Tracker](#plausible-analytics-tracker)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Tracking page views](#tracking-page-views)
    - [Automatically tracking page views](#automatically-tracking-page-views)
      - [Cleaning up the event listeners](#cleaning-up-the-event-listeners)
    - [Tracking custom events and goals](#tracking-custom-events-and-goals)
  - [Reference documentation](#reference-documentation)

## Features
- Less than 1kb!
- Same features as the official script, but as an NPM module
- Automatically track page views in your SPA apps
- Track goals and custom events
- Provide manual values that will be bound to the event
- Full typescript support

## Installation

To install, simply run:

```bash
npm install plausible-tracker

yarn add plausible-tracker
```

## Usage

To begin tracking events, you must initialize the tracker:

```ts
import Plausible from 'plausible-tracker'

const plausible = Plausible({
  domain: 'my-app.com'
})
```

`Plausible()` accepts some optional options that you may want to provide:

| Option         | Type            | Description                                                       | Default                     |
| -------------- | --------------- | ----------------------------------------------------------------- | --------------------------- |
| domain         | `string`        | Your site's domain, as declared by you in Plausible's settings    | `location.hostname`         |
| hashMode       | `bool`          | Enables tracking based on URL hash changes.                       | `false`                     |
| trackLocalhost | `bool`          | Enables tracking on *localhost*.                                  | `false`                     |
| url            | `string`        | Current page's URL.                                               | `location.href`             |
| referrer       | `string | null` | Referrer's address                                                | `document.referrer || null` |
| deviceWidth    | `number`        | User's device width for device tracking.                          | `window.innerWidth`         |
| apiHost        | `string`        | Plausible's API host to use. Change this if you are self-hosting. | `'https://plausible.io'`    |

The object returned from `Plausible()` contains the functions that you'll use to track your events. These functions are:

- `pageView()`: Tracks a single page view.
- `trackEvent()`: Tracks custom events and goals
- `enableAutoPageViews()`: Enables automatic page view tracking for SPAs

For the complete documentation on these functions and their parameters, check out the [reference documentation](https://maronato.github.io/plausible-tracker/).

### Tracking page views

To track a page view, use the `pageView` function provided

```ts
import Plausible from 'plausible-tracker'

const { pageView } = Plausible()

// Track a page view
pageView()
```

You may also override the values you provided when initializing the tracker by passing a similar object as the first parameter:

```ts
import Plausible from 'plausible-tracker'

const { pageView } = Plausible({
  // Provide a default referrer
  referrer: "facebook.com",
})

// And override it on this call
pageView({ referrer: "google.com" })
```

The second parameter is an object with some options similar to the ones provided by the [official Plausible script](https://docs.plausible.io/custom-event-goals). 

The only supported option at the moment is `callback` – a function that is called once the event is logged successfully.

```ts
import Plausible from 'plausible-tracker'

const { pageView } = Plausible()

// And override it on this call
pageView({}, { callback: () => console.log("Done!") })
```

### Automatically tracking page views

If your app is an SPA that uses JS-based routing, you'll need to use browser events to manually track page views. A built-in function `enableAutoPageViews` enables automatic tracking for you so you don't need to write custom logic.

```ts
import Plausible from 'plausible-tracker'

const { enableAutoPageViews } = Plausible()

// This tracks the current page view and all future ones as well
enableAutoPageViews()
```

If your app uses URL hashes to represent pages, set `hashMode` to `true`:

```ts
import Plausible from 'plausible-tracker'

const { enableAutoPageViews } = Plausible({
  hashMode: true
})

// Hash changes will also trigger page views
enableAutoPageViews()
```

The way it works is by overriding `history.pushState` and attaching event listeners to `popstate` and `hashchange` (only if you set `hashMode` to `true`). If your frontend framework uses other methods to manage navigation, you might want to write your own logic using `pageView` to manually trigger page views.

#### Cleaning up the event listeners

When you call `enableAutoPageViews()`, it adds some event listeners and overrides `history.pushState`. To remove them and restore `history.pushState`, call the cleanup function returned by `enableAutoPageViews()`:

```ts
import Plausible from 'plausible-tracker'

const { enableAutoPageViews } = Plausible()

const cleanup = enableAutoPageViews()

// ...

// Remove event listeners and restore history.pushState
cleanup()
```

### Tracking custom events and goals

To track goals, all you need to do is call `trackEvent` and give it the name of the goal/event as the first parameter:

```ts
import Plausible from 'plausible-tracker'

const { trackEvent } = Plausible()

// Tracks the 'signup' goal
trackEvent('signup')
```

As with [`pageView`](#tracking-page-views), you may also provide override values and a callback as the second and third parameters respectively:

```ts
import Plausible from 'plausible-tracker'

const { trackEvent } = Plausible({
  referrer: 'facebook.com',
})

// Tracks the 'signup' goal with a different referrer and a callback
trackEvent(
  'signup',
  { referrer: 'google.com' },
  { callback: () => console.log('done') }
);
```

## Reference documentation
For the full method and type documentation, check out the [reference documentation](https://maronato.github.io/plausible-tracker).
