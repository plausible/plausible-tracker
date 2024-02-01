import type { EventData, EventPayload } from './types'

/**
 * Check if the protocol is file
 *
 * @param {string} protocol - The current protocol
 *
 * @returns {boolean} - If the protocol is file
 */
export function isFile(protocol: string): boolean {
  return protocol === 'file:'
}

/**
 * Check if the hostname is blacklisted
 *
 * @param hostname - The current hostname
 * @param blackListedHostnames - Hostnames to ignore
 * @returns - If the hostname is blacklisted
 */
export function isBlackListed(hostname: string, blackListedHostnames: string[]): boolean {
  return blackListedHostnames.includes(hostname)
}

/**
 * Check if the user exclude itself using localStorage
 *
 * @returns - If the user exclude itself
 */
export function isUserExcludeItself(): boolean {
  // If localStorage is not available, return false
  try {
    return localStorage.getItem('plausible_ignore') === 'true'
  }
  catch (e) {
    return false
  }
}

/**
 * Create the event data
 *
 * @param data - The event data
 * @returns - The event data
 */
export function createEventData(data: Partial<EventData> = {}): EventData {
  const { url, referrer, deviceWidth } = data

  return {
    url: url ?? location.href,
    referrer: referrer ?? document.referrer,
    deviceWidth: deviceWidth ?? window.innerWidth,
  }
}

/**
 * Send an event to the API
 *
 * @param apiHost - The base API URL
 * @param payload - The event payload
 */
export function sendEvent(apiHost: string, payload: EventPayload, callback?: () => void) {
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
