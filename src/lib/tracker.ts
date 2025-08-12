import { EventOptions, sendEvent } from './request';

declare global {
  // eslint-disable-next-line functional/prefer-type-literal
  interface Window {
    // eslint-disable-next-line functional/prefer-readonly-type
    plausible: TrackEvent;
  }
}

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
 * Data passed to Plausible as events.
 */
export type PlausibleEventData = {
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
 * Options used when tracking Plausible events.
 */
export type PlausibleOptions = PlausibleInitOptions & PlausibleEventData;

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
 *
 * // Tracks the 'Download' goal passing a 'method' property.
 * trackEvent('Download', { props: { method: 'HTTP' } })
 * ```
 *
 * @param eventName - Name of the event to track
 * @param options - Event options.
 * @param eventData - Optional event data to send. Defaults to the current page's data merged with the default options provided earlier.
 */
type TrackEvent = (
  eventName: string,
  options?: EventOptions,
  eventData?: PlausibleOptions
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
 * @param options - Event options.
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
 * Tracks all outbound link clicks automatically
 *
 * Call this if you don't want to manually manage these links.
 *
 * It works using a **[MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)** to automagically detect link nodes throughout your application and bind `click` events to them.
 *
 * Optionally takes the same parameters as [`MutationObserver.observe`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe).
 *
 * ### Example
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { enableAutoOutboundTracking } = Plausible()
 *
 * // This tracks all the existing and future outbound links on your page.
 * enableAutoOutboundTracking()
 * ```
 *
 * The returned value is a callback that removes the added event listeners and disconnects the observer
 * ```js
 * import Plausible from 'plausible-tracker'
 *
 * const { enableAutoOutboundTracking } = Plausible()
 *
 * const cleanup = enableAutoOutboundTracking()
 *
 * // Remove event listeners and disconnect the observer
 * cleanup()
 * ```
 */
type EnableAutoOutboundTracking = (
  targetNode?: Node & ParentNode,
  observerInit?: MutationObserverInit
) => Cleanup;

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
  readonly enableAutoOutboundTracking: EnableAutoOutboundTracking;
} {
  const modifyWindow = () => {
    // eslint-disable-next-line functional/immutable-data
    window.plausible = trackEvent;
  };

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

  const trackEvent: TrackEvent = (eventName, options, eventData) => {
    sendEvent(eventName, { ...getConfig(), ...eventData }, options);
  };

  modifyWindow();

  const trackPageview: TrackPageview = (eventData, options) => {
    trackEvent('pageview', options, eventData);
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

  const enableAutoOutboundTracking: EnableAutoOutboundTracking = (
    targetNode: Node & ParentNode = document,
    observerInit: MutationObserverInit = {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    }
  ) => {
    function trackClick(this: HTMLAnchorElement, event: MouseEvent) {
      // auxclick is fired for any mouse-button except primary (left).
      // The event should only be sent on aux (middle) click, return for others (right, etc).
      const auxEvent = event.type === 'auxclick';
      if (auxEvent && event.button !== 1) return;

      trackEvent('Outbound Link: Click', { props: { url: this.href } });

      // _self (same as falsy), _parent and _top need a delay for the request to go through.
      // _blank opens a new tab -> no need for delay
      // no special handling for custom targets -> use the default browser behavior
      /* istanbul ignore next */
      if (
        (!this.target || this.target.match(/^_(self|parent|top)$/i)) &&
        !auxEvent && // middle mouse click opens a new tab -> no need for delay
        !event.ctrlKey && // ctrl + click opens a new tab -> no need for delay
        !event.metaKey && // same as ctrl
        !event.shiftKey && // shift + click opens a new window -> no need for delay
        // don't try to access location object during testing
        !(
          typeof process !== 'undefined' &&
          process &&
          process.env.NODE_ENV === 'test'
        )
      ) {
        setTimeout(() => {
          switch (this.target) {
            case '_top':
              // eslint-disable-next-line functional/immutable-data
              (window.top ?? window).location.href = this.href;
              break;
            case '_parent':
              // eslint-disable-next-line functional/immutable-data
              window.parent.location.href = this.href;
              break;
            default:
              // eslint-disable-next-line functional/immutable-data
              location.href = this.href;
              break;
          }
        }, 150);

        event.preventDefault();
      }
    }

    // eslint-disable-next-line functional/prefer-readonly-type
    const tracked: Set<HTMLAnchorElement> = new Set();

    function addNode(node: Node | ParentNode) {
      if (node instanceof HTMLAnchorElement) {
        if (node.host !== location.host) {
          node.addEventListener('click', trackClick);
          node.addEventListener('auxclick', trackClick);
          tracked.add(node);
        }
      } /* istanbul ignore next */ else if ('querySelectorAll' in node) {
        node.querySelectorAll('a').forEach(addNode);
      }
    }

    function removeNode(node: Node | ParentNode) {
      if (node instanceof HTMLAnchorElement) {
        node.removeEventListener('click', trackClick);
        node.removeEventListener('auxclick', trackClick);
        tracked.delete(node);
      } /* istanbul ignore next */ else if ('querySelectorAll' in node) {
        node.querySelectorAll('a').forEach(removeNode);
      }
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          // Handle changed href
          removeNode(mutation.target);
          addNode(mutation.target);
        } /* istanbul ignore next */ else if (mutation.type === 'childList') {
          // Handle added nodes
          mutation.addedNodes.forEach(addNode);
          // Handle removed nodes
          mutation.removedNodes.forEach(removeNode);
        }
      });
    });

    // Track existing nodes
    targetNode.querySelectorAll('a').forEach(addNode);

    // Observe mutations
    observer.observe(targetNode, observerInit);

    return function cleanup() {
      tracked.forEach((a) => {
        a.removeEventListener('click', trackClick);
        a.removeEventListener('auxclick', trackClick);
      });
      tracked.clear();
      observer.disconnect();
    };
  };

  return {
    trackEvent,
    trackPageview,
    enableAutoPageviews,
    enableAutoOutboundTracking,
  };
}
