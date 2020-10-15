import { EventOptions, sendEvent } from './request';

/**
 * Options used when initializing the tracker.
 */
export type PlausibleInitOptions = {
  /**
   * If true, pageviews will be tracked when the URL hash changes.
   * Enable this if you are using a frontend that uses hash-based routing.
   */
  readonly hashMode?: boolean;
  /**
   * Set to true if you want events to be tracked when running the site locally.
   */
  readonly trackLocalhost?: boolean;
  /**
   * The domain to bind the event to.
   * Defaults to `location.hostname`
   */
  readonly domain?: Location['hostname'];
  /**
   * The API host where the events will be sent.
   * Defaults to `'https://plausible.io'`
   */
  readonly apiHost?: string;
};

/**
 * Options used when tracking Plausible events.
 */
export type PlausibleOptions = PlausibleInitOptions & {
  /**
   * The URL to bind the event to.
   * Defaults to `location.href`.
   */
  readonly url?: Location['href'];
  /**
   * The referrer to bind the event to.
   * Defaults to `document.referrer`
   */
  readonly referrer?: Document['referrer'] | null;
  /**
   * The current device's width.
   * Defaults to `window.innerWidth`
   */
  readonly deviceWidth?: Window['innerWidth'];
};

/**
 * Tracks a custom event.
 *
 * Use it to track your defined goals by providing the goal's name as `eventName`.
 *
 * ### Example
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { trackEvent } = Plausible()
 *
 * // Tracks the 'signup' goal
 * trackEvent('signup')
 * ```
 *
 * @param eventName - Name of the event to track
 * @param eventData - Optional event data to send. Defaults to the current page's data merged with the default options provided earlier.
 * @param options - Event options. The only supported option at the moment is `callback` – a function that is called once the event is logged successfully.
 */
type TrackEvent = (
  eventName: string,
  eventData?: PlausibleOptions,
  options?: EventOptions
) => void;

/**
 * Manually tracks a page view.
 *
 * ### Example
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { trackPageview } = Plausible()
 *
 * // Track a page view
 * trackPageview()
 * ```
 *
 * @param eventData - Optional event data to send. Defaults to the current page's data merged with the default options provided earlier.
 * @param options - Event options. The only supported option at the moment is `callback` – a function that is called once the event is logged successfully.
 */
type TrackPageview = (
  eventData?: PlausibleOptions,
  options?: EventOptions
) => void;

/**
 * Cleans up all event listeners attached.
 */
type Cleanup = () => void;

/**
 * Tracks the current page and all further pages automatically.
 *
 * Call this if you don't want to manually manage pageview tracking.
 *
 * ### Example
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { enableAutoPageviews } = Plausible()
 *
 * // This tracks the current page view and all future ones as well
 * enableAutoPageviews()
 * ```
 *
 * The returned value is a callback that removes the added event listeners and restores `history.pushState`
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { enableAutoPageviews } = Plausible()
 *
 * const cleanup = enableAutoPageviews()
 *
 * // Remove event listeners and restore `history.pushState`
 * cleanup()
 * ```
 */
type EnableAutoPageviews = () => Cleanup;

/**
 * Initializes the tracker with your default values.
 *
 * ### Example (es module)
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { enableAutoPageviews, trackEvent } = Plausible({
 *   domain: 'my-app-domain.com',
 *   hashMode: true
 * })
 *
 * enableAutoPageviews()
 *
 * function onUserRegister() {
 *   trackEvent('register')
 * }
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var Plausible = require('plausible-tracker');
 *
 * var { enableAutoPageviews, trackEvent } = Plausible({
 *   domain: 'my-app-domain.com',
 *   hashMode: true
 * })
 *
 * enableAutoPageviews()
 *
 * function onUserRegister() {
 *   trackEvent('register')
 * }
 * ```
 *
 * @param defaults - Default event parameters that will be applied to all requests.
 */
export default function Plausible(
  defaults?: PlausibleInitOptions
): {
  readonly trackEvent: TrackEvent;
  readonly trackPageview: TrackPageview;
  readonly enableAutoPageviews: EnableAutoPageviews;
} {
  const getConfig = (): Required<PlausibleOptions> => ({
    hashMode: false,
    trackLocalhost: false,
    url: location.href,
    domain: location.hostname,
    referrer: document.referrer || null,
    deviceWidth: window.innerWidth,
    apiHost: 'https://plausible.io',
    ...defaults,
  });

  const trackEvent: TrackEvent = (eventName, eventData, options) => {
    sendEvent(eventName, { ...getConfig(), ...eventData }, options);
  };

  const trackPageview: TrackPageview = (eventData, options) => {
    trackEvent('pageview', eventData, options);
  };

  const enableAutoPageviews: EnableAutoPageviews = () => {
    const page = () => trackPageview();
    // Attach pushState and popState listeners
    const originalPushState = history.pushState;
    if (originalPushState) {
      // eslint-disable-next-line functional/immutable-data
      history.pushState = function (data, title, url) {
        originalPushState.apply(this, [data, title, url]);
        page();
      };
      addEventListener('popstate', page);
    }

    // Attach hashchange listener
    if (defaults && defaults.hashMode) {
      addEventListener('hashchange', page);
    }

    // Trigger first page view
    trackPageview();

    return function cleanup() {
      if (originalPushState) {
        // eslint-disable-next-line functional/immutable-data
        history.pushState = originalPushState;
        removeEventListener('popstate', page);
      }
      if (defaults && defaults.hashMode) {
        removeEventListener('hashchange', page);
      }
    };
  };

  return { trackEvent, trackPageview, enableAutoPageviews };
}
