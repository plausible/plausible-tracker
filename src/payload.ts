import type { EventData, EventOptions, EventPayload, PlausibleOptions } from './types'

export function createPayload(eventName: string, plausibleOptions: Required<PlausibleOptions>, data: EventData, options?: EventOptions): EventPayload {
  const payload: EventPayload = {
    n: eventName,
    u: data.url,
    d: plausibleOptions.domain,
    r: data.referrer,
    w: data.deviceWidth,
    h: plausibleOptions.hashMode ? 1 : 0,
    p: options && options.props ? JSON.stringify(options.props) : undefined,
  }

  return payload
}
