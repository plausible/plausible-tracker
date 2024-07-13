import type { EventData, EventPayload } from './types'

/**
 * Check if the protocol is file
 *
 * @returns - If the protocol is file
 */
export function isFile(
  /** The current protocol */
  protocol: string,
): boolean {
  return protocol === 'file:'
}

/**
 * Check if the hostname is ignored.
 *
 * @returns - If the hostname is ignored
 */
export function isIgnored(
  /** The current hostname */
  hostname: string,
  /** Hostnames to ignore */
  ignoredHostnames: string[],
  /** Ignore sub domain  */
  ignoreSubDomains: boolean,
): boolean {
  if (ignoreSubDomains)
    // Both `example.com` and `sub.example.com` will be ignored
    return ignoredHostnames.some(ignoredHostname => hostname === ignoredHostname || hostname.endsWith(`.${ignoredHostname}`))

  // Only `example.com` will be ignored
  return ignoredHostnames.includes(hostname)
}

/**
 * Check if the user has excluded himself using `localStorage`.
 *
 * @returns - If the user exclude himself
 */
export function isUserSelfExcluded(): boolean {
  // If localStorage is not available, return false
  try {
    return localStorage.getItem('plausible_ignore') === 'true'
  }
  catch (e) {
    return false
  }
}

/**
 * Create the event data.
 *
 * @returns - The event data
 */
export function createEventData(
  /** The event data */
  data: Partial<EventData> = {},
): EventData {
  const { url, referrer, deviceWidth } = data

  return {
    url: url ?? window.location.href,
    referrer: referrer ?? document.referrer,
    deviceWidth: deviceWidth ?? window.innerWidth,
  }
}

/**
 * Send an event to the API.
 */
export function sendEvent(
  /** The base API URL */
  apiHost: string,
  /** The event payload */
  payload: EventPayload,
  callback?: () => void,
) {
  return fetch(`${apiHost}/api/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  }).then(() => {
    callback?.()
  })
}
