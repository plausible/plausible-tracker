# Plausible Analytics Tracker

[![NPM](https://flat.badgen.net/npm/v/plausible-tracker)](https://www.npmjs.com/package/plausible-tracker)  [![Bundle](https://flat.badgen.net/bundlephobia/minzip/plausible-tracker)](https://bundlephobia.com/result?p=plausible-tracker@latest)

[![Build Status](https://travis-ci.com/plausible/plausible-tracker.svg?branch=master)](https://travis-ci.com/plausible/plausible-tracker) [![codecov](https://codecov.io/gh/plausible/plausible-tracker/branch/master/graph/badge.svg)](https://codecov.io/gh/plausible/plausible-tracker) [![Netlify Status](https://api.netlify.com/api/v1/badges/d29c0d49-6ba4-412b-af90-d21865eb40f2/deploy-status)](https://app.netlify.com/sites/plausible-tracker/deploys)


[![dependencies Status](https://david-dm.org/plausible/plausible-tracker/status.svg)](https://david-dm.org/maronato/plausible-tracker) [![devDependencies Status](https://david-dm.org/plausible/plausible-tracker/dev-status.svg)](https://david-dm.org/maronato/plausible-tracker?type=dev)


Frontend library to interact with [Plausible Analytics](https://plausible.io/).

- [Plausible Analytics Tracker](#plausible-analytics-tracker)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Tracking page views](#tracking-page-views)
    - [Automatically tracking page views](#automatically-tracking-page-views)
      - [Cleaning up the event listeners](#cleaning-up-the-event-listeners)
    - [Tracking custom events and goals](#tracking-custom-events-and-goals)
    - [Outbound link click tracking](#outbound-link-click-tracking)
      - [Cleaning up the event listeners](#cleaning-up-the-event-listeners-1)
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

`Plausible()` accepts some [options](https://plausible-tracker.netlify.app/globals.html#plausibleinitoptions) that you may want to provide:

| Option         | Type     | Description                                                       | Default                  |
| -------------- | -------- | ----------------------------------------------------------------- | ------------------------ |
| domain         | `string` | Your site's domain, as declared by you in Plausible's settings    | `location.hostname`      |
| hashMode       | `bool`   | Enables tracking based on URL hash changes.                       | `false`                  |
| trackLocalhost | `bool`   | Enables tracking on *localhost*.                                  | `false`                  |
| apiHost        | `string` | Plausible's API host to use. Change this if you are self-hosting. | `'https://plausible.io'` |

The object returned from `Plausible()` contains the functions that you'll use to track your events. These functions are:

- [`trackPageview()`](https://plausible-tracker.netlify.app/globals.html#trackpageview): Tracks a single page view.
- [`trackEvent()`](https://plausible-tracker.netlify.app/globals.html#trackevent): Tracks custom events and goals
- [`enableAutoPageviews()`](https://plausible-tracker.netlify.app/globals.html#enableautopageviews): Enables automatic page view tracking for SPAs

For the complete documentation on these functions and their parameters, check out the [reference documentation](https://plausible-tracker.netlify.app/).

### Tracking page views

To track a page view, use the `trackPageview` function provided

```ts
import Plausible from 'plausible-tracker'

const { trackPageview } = Plausible()

// Track a page view
trackPageview()
```

You may also override the values you provided when initializing the tracker by passing a [similar object](https://plausible-tracker.netlify.app/globals.html#plausibleoptions) as the first parameter.

This object takes the same options as the initialization one, plus the following:

| Option      | Type               | Description                              | Default             |
| ----------- | ------------------ | ---------------------------------------- | ------------------- |
| url         | `string`           | Current page's URL.                      | `location.href`     |
| referrer    | `string` or `null` | Referrer's address                       | `document.referrer` |
| deviceWidth | `number`           | User's device width for device tracking. | `window.innerWidth` |


```ts
import Plausible from 'plausible-tracker'

const { trackPageview } = Plausible({
  // Track localhost by default
  trackLocalhost: true,
})

// Override it on this call and also set a custom url
trackPageview({
  trackLocalhost: false,
  url: "https://my-app.com/my-url"
})
```

The second parameter is an object with [some options](https://plausible-tracker.netlify.app/globals.html#eventoptions) similar to the ones provided by the [official Plausible script](https://docs.plausible.io/custom-event-goals). 

```ts
import Plausible from 'plausible-tracker'

const { trackPageview } = Plausible()

// And override it on this call
trackPageview({}, { callback: () => console.log("Done!") })
```

### Automatically tracking page views

If your app is a SPA that uses JS-based routing, you'll need to use browser events to manually track page views. A built-in function `enableAutoPageviews` enables automatic tracking for you so you don't need to write custom logic.

```ts
import Plausible from 'plausible-tracker'

const { enableAutoPageviews } = Plausible()

// This tracks the current page view and all future ones as well
enableAutoPageviews()
```

If your app uses URL hashes to represent pages, set `hashMode` to `true`:

```ts
import Plausible from 'plausible-tracker'

const { enableAutoPageviews } = Plausible({
  hashMode: true
})

// Hash changes will also trigger page views
enableAutoPageviews()
```

The way it works is by overriding `history.pushState` and attaching event listeners to `popstate` and `hashchange` (only if you set `hashMode` to `true`). If your frontend framework uses other methods to manage navigation, you might want to write your own logic using `trackPageview` to manually trigger page views.

#### Cleaning up the event listeners

When you call `enableAutoPageviews()`, it adds some event listeners and overrides `history.pushState`. To remove them and restore `history.pushState`, call the cleanup function returned by `enableAutoPageviews()`:

```ts
import Plausible from 'plausible-tracker'

const { enableAutoPageviews } = Plausible()

const cleanup = enableAutoPageviews()

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

Custom props can be provided using the second parameter:
```ts
// Tracks the 'download' goal and provides a 'method' property.
trackEvent('download', { props: { method: 'HTTP' } })
```

As with [`trackPageview`](#tracking-page-views), you may also provide override values but now through the third parameter:

```ts
import Plausible from 'plausible-tracker'

const { trackEvent } = Plausible({
  trackLocalhost: false,
})

// Tracks the 'signup' goal with a callback, props and a different referrer.
trackEvent(
  'signup',
  {
    callback: () => console.log('done'),
    props: {
      variation: 'button A'
    }
  },
  { trackLocalhost: true }
);
```

### Outbound link click tracking

You can also track all clicks to outbound links using `enableAutoOutboundTracking`.

For details on how to setup the tracking, visit the [docs](https://docs.plausible.io/outbound-link-click-tracking).

This function adds a `click` event listener to all `a` tags on the page and reports them to Plausible. It also creates a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) that efficiently tracks node mutations, so dynamically-added links are also tracked.

```ts
import Plausible from 'plausible-tracker'

const { enableAutoOutboundTracking } = Plausible()

// Track all existing and future outbound links
enableAutoOutboundTracking()
```

#### Cleaning up the event listeners

When you call `enableAutoOutboundTracking()`, it adds some event listeners and initializes a `MutationObserver`. To remove them, call the cleanup function returned by `enableAutoOutboundTracking()`:

```ts
import Plausible from 'plausible-tracker'

const { enableAutoOutboundTracking } = Plausible()

const cleanup = enableAutoOutboundTracking()

// ...

// Remove event listeners and disconnect the MutationObserver
cleanup()
```

### Opt out and exclude yourself from the analytics

Since plausible-tracker is bundled with your application code, using an ad-blocker to exclude your visits isn't an option. Fortunately Plausible has an alternative for this scenario: plausible-tracker will not send events if `localStorage.plausible_ignore` is set to `"true"`.

More information about this method can be found in the [Plausible documentation](https://plausible.io/docs/excluding-localstorage).

## Reference documentation
For the full method and type documentation, check out the [reference documentation](https://plausible-tracker.netlify.app).
