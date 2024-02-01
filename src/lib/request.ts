import type { PlausibleOptions } from './tracker';

/**
 * @internal
 */
type EventPayload = {
  readonly n: string;
  readonly u: Location['href'];
  readonly d: Location['hostname'];
  readonly r: Document['referrer'] | null;
  readonly w: Window['innerWidth'];
  readonly h: 1 | 0;
  readonly p?: string;
};

// eslint-disable-next-line functional/no-mixed-type
export type EventOptions = {
  /**
   * Callback called when the event is successfully sent.
   */
  readonly callback?: () => void;
  /**
   * Properties to be bound to the event.
   */
  readonly props?: { readonly [propName: string]: string | number | boolean };
};

/**
 * @internal
 * Sends an event to Plausible's API
 *
 * @param data - Event data to send
 * @param options - Event options
 */
export function sendEvent(
  eventName: string,
  data: Required<PlausibleOptions>,
  options?: EventOptions
): void {
  const isLocalhost =
    /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/.test(
      location.hostname
    ) || location.protocol === 'file:';

  const payload: EventPayload = {
    n: eventName,
    u: data.url,
    d: data.domain,
    r: data.referrer,
    w: data.deviceWidth,
    h: data.hashMode ? 1 : 0,
    p: options && options.props ? JSON.stringify(options.props) : undefined,
  };

  if (!data.trackLocalhost && isLocalhost) {
    return console.warn(
      `[Plausible] Ignoring event`, payload
    );
  }

  try {
    if (window.localStorage.plausible_ignore === 'true') {
      return console.warn(
        '[Plausible] Ignoring event because "plausible_ignore" is set to "true" in localStorage'
      );
    }
  } catch (e) {
    null;
  }

  fetch(`${data.apiHost}/api/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  }).then((response) => {
    if (response.ok) {
      if (options && options.callback) {
        options.callback();
      }
    }
  });
}
