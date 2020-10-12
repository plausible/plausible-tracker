import { EventOptions, sendEvent } from './request';

/**
 * Options used when tracking Plausible events.
 */
export type PlausibleOptions = {
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
   * The URL to bind the event to.
   * Defaults to `location.href`.
   */
  readonly url?: Location['href'];
  /**
   * The domain to bind the event to.
   * Defaults to `location.hostname`
   */
  readonly domain?: Location['hostname'];
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
  /**
   * The API host where the events will be sent.
   * Defaults to `'https://plausible.io'`
   */
  readonly apiHost?: string;
};

/**
 * Tracks a custom event.
 *
 * Use it to track your defined goals by providing the goal's name as `eventName`.
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
 * @param eventData - Optional event data to send. Defaults to the current page's data merged with the default options provided earlier.
 * @param options - Event options. The only supported option at the moment is `callback` – a function that is called once the event is logged successfully.
 */
type PageView = (eventData?: PlausibleOptions, options?: EventOptions) => void;

/**
 * Cleans up all event listeners attached.
 */
type Cleanup = () => void;

/**
 * Tracks the current page and all further pages automatically.
 *
 * Call this if you don't want to manually manage pageview tracking.
 */
type EnableAutoPageViews = () => Cleanup;

/**
 * Initializes the tracker with your default values.
 *
 * ### Example (es module)
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { enableAutoPageViews, trackEvent } = Plausible({
 *   domain: 'my-app-domain.com',
 *   hashMode: true
 * })
 *
 * enableAutoPageViews()
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
 * var { enableAutoPageViews, trackEvent } = Plausible({
 *   domain: 'my-app-domain.com',
 *   hashMode: true
 * })
 *
 * enableAutoPageViews()
 *
 * function onUserRegister() {
 *   trackEvent('register')
 * }
 * ```
 *
 * @param defaults - Default event parameters that will be applied to all requests.
 */
export default function Plausible(
  defaults?: PlausibleOptions
): {
  readonly trackEvent: TrackEvent;
  readonly pageView: PageView;
  readonly enableAutoPageViews: EnableAutoPageViews;
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

  const trackEvent: TrackEvent = (
    eventName: string,
    eventData?: PlausibleOptions,
    options?: EventOptions
  ) => {
    sendEvent(eventName, { ...getConfig(), ...eventData }, options);
  };

  const pageView: PageView = (
    eventData?: PlausibleOptions,
    options?: EventOptions
  ) => {
    trackEvent('pageview', eventData, options);
  };

  const enableAutoPageViews: EnableAutoPageViews = () => {
    const page = () => pageView();
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
    if (defaults?.hashMode) {
      addEventListener('hashchange', page);
    }

    // Trigger first page view
    pageView();

    return function cleanup() {
      if (originalPushState) {
        // eslint-disable-next-line functional/immutable-data
        history.pushState = originalPushState;
        removeEventListener('popstate', page);
      }
      if (defaults?.hashMode) {
        removeEventListener('hashchange', page);
      }
    };
  };

  return { trackEvent, pageView, enableAutoPageViews };
}
