# Plausible Analytics Tracker

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

A rewrite of [plausible-tracker](https://github.com/plausible/plausible-tracker) with extensibility and future features in mind.

> [!IMPORTANT]
> This is not a drop-in replacement.

## Why a rewrite?

The original tracker from the Plausible team have not received updates for more than 2 years.

Since then, the [script tracker](https://plausible.io/docs/script-extensions) have evolved but not the npm package. The file downlaods and revenue tracking are not supported, for example.

Also, some serious issues were opened and not addressed. The outbound tracking was breaking the `target="_blank"` attribute, for example.

## Usage

First, install the package:

```bash
npm install @barbapapazes/plausible-tracker
```

Then, use it in your code:

```ts
import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'

const plausible = createPlausibleTracker()

plausible.trackPageview() // Track a page view
plausible.trackEvent('signup') // Track a custom event
```

> [!NOTE]
> The `trackPageview` is a wrapper around `trackEvent` with the `pageview` event name.

First argument of `trackPageview` and second of `trackEvent` is an object accepting props, data and a callback that is triggered after the event is sent.

Props are similar to the ones provided by the [official Plausible script](https://plausible.io/docs/custom-props/for-custom-events#2-using-the-manual-method).

Data allows you to override some values like the `url`, `referrer` and `deviceWidth`.

```ts
plausible.trackEvent('signup', { props: { variation: 'button A' }, callback: () => console.log('sended') }) // Track a custom event with a custom prop with a callback
```

This core tracker is minimal and does not include any extensions. So you can easily compose it to avoid to ship code that you don't need.

## Extensions

The extensions are the features that are not included in the core tracker.

> [!NOTE]
> Extensions will help to maintain the package up to date with the official script.

Current extensions:

- [Auto pageview tracking](https://plausible.io/docs/auto-pageview-tracking)
- [Outbound link click tracking](https://plausible.io/docs/outbound-link-click-tracking)
- [File downloads tracking](https://plausible.io/docs/file-downloads-tracking)

### Auto pageview tracking

```ts
import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'
import { useAutoPageviews } from '@barbapapazes/plausible-tracker/extensions'

const plausible = createPlausibleTracker()

const { install, cleanup, setPageOptions } = useAutoPageviews(plausible)

install()

// At any time, you can stop the auto pageview tracking
cleanup()

// You can also set the page options
setPageOptions({ props: { variation: 'button A' } })
// Now, every page view will include the prop `variation: 'button A'`
```

### Outbound link click tracking

```ts
import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'
import { useAutoOutboundTracking } from '@barbapapazes/plausible-tracker/extensions'

const plausible = createPlausibleTracker()

const { install, cleanup, setPageOptions } = useOutboundLinkTracking(plausible)

install()

// At any time, you can stop the outbound link tracking
cleanup()

// You can also set the page options
setPageOptions({ props: { variation: 'button A' } })
```

### File downloads tracking

```ts
import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'
import { useAutoFileDownloadsTracking } from '@barbapapazes/plausible-tracker/extensions'

const plausible = createPlausibleTracker()

const { install, cleanup, setPageOptions } = useFileDownloadsTracking(plausible, { fileTypes: [] }) // You can pass the file types to track. For example: ['pdf', 'zip']

install()

// At any time, you can stop the file downloads tracking
cleanup()

// You can also set the page options
setPageOptions({ props: { variation: 'button A' } })
```

> [!IMPORTANT]
> By default, the file downloads does not track any file type. You need to pass the file types to track.

The package exports the `defaultFileTypes` that is an array with the most common file types which are [the same as the official script](https://plausible.io/docs/file-downloads-tracking#which-file-types-are-tracked).

```ts
import { defaultFileTypes } from '@barbapapazes/plausible-tracker/extensions'

const { install, cleanup, setPageOptions } = useFileDownloadsTracking(plausible, { fileTypes: defaultFileTypes })
```

This allows you to easily customize the file types to track:

```ts
import { defaultFileTypes } from '@barbapapazes/plausible-tracker/extensions'

const { install, cleanup, setPageOptions } = useFileDownloadsTracking(plausible, { fileTypes: [...defaultFileTypes, 'svg'] })
```

## Contribute

Contributions are more than welcome. I'm not part of the Plausible team and I'm doing this in my free time. 💛

- Fork the repository
- Install the dependencies: `pnpm install`
- Build the project: `pnpm build`
- Use playground to test your changes: `cd playground && pnpm dev`

Thank you for your help!

## License

[MIT](./LICENSE) © [Barbapapazes](https://github.com/barbapapazes)

This package is not affiliated with Plausible Analytics but inspired by their work.
[plausible-tracker](https://github.com/plausible/plausible-tracker)
[Plausible Analytics Tracker](https://github.com/plausible/analytics/tree/master/tracker)

[npm-version-src]: https://img.shields.io/npm/v/@barbapapazes/plausible-tracker?style=flat&colorA=18181B&colorB=0ea5e9
[npm-version-href]: https://npmjs.com/package/@barbapapazes/plausible-tracker
[npm-downloads-src]: https://img.shields.io/npm/dm/@barbapapazes/plausible-tracker?style=flat&colorA=18181B&colorB=0ea5e9
[npm-downloads-href]: https://npmjs.com/package/@barbapapazes/plausible-tracker
