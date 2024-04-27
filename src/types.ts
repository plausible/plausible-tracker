export interface Plausible {
  options: PlausibleOptions
  /**
   * Send a custom event.
   *
   * @param eventName - The event name
   * @param options - The event options
   */
  trackEvent: (eventName: EventName, options?: EventOptions) => void
  /**
   * Send a pageview event.
   *
   * @param options - The event options
   */
  trackPageview: (options?: EventOptions) => void
}

export type EventName = 'pageview' | 'Outbound Link: Click' | 'File Download' | string & Record<never, never>

export interface PlausibleOptions {
  /**
   * Enable or disable tracker.
   *
   * @default true
   */
  readonly enabled: boolean
  /**
   * If true, pageviews will be tracked when the URL hash changes.
   * Enable this if you are using a frontend that uses hash-based routing.
   *
   * @default false
   */
  readonly hashMode: boolean
  /**
   * The domain to bind the event to.
   *
   * @default location.hostname
   */
  readonly domain: Location['hostname']
  /**
   * The API host where the events will be sent.
   *
   * @default 'https://plausible.io'
   */
  readonly apiHost: string
  /**
   * Hostnames to ignore. Useful for development environments.
   *
   * @default ['localhost']
   */
  readonly ignoredHostnames: string[]
  /**
   * If `ignoredHostnames` should be used as suffixes.
   * This means that `example.com` will also ignore `sub.example.com`.
   *
   * @default false
   */
  readonly ignoreSubDomains: boolean
  /**
   * Log events to the console when ignored.
   *
   * @default false
   */
  readonly logIgnored: boolean
}

export interface EventOptions extends EventProps {
  data?: Partial<EventData>
  /**
   * Callback to be called after the event is sent.
   */
  callback?: () => void
}

/**
 * Shape of the event options
 */
export interface EventProps {
  /**
   * Properties to be bound to the event.
   */
  readonly props?: { readonly [propName: string]: string | number | boolean }
}

/**
 * Shape of the event data
 */
export interface EventData {
  /**
   * The URL to bind the event to.
   *
   * @default location.href
   */
  readonly url: Location['href']
  /**
   * The referrer to bind the event to.
   *
   * @default document.referrer
   */
  readonly referrer: Document['referrer'] | null
  /**
   * The current device's width.
   *
   * @default window.innerWidth
   */
  readonly deviceWidth: Window['innerWidth']
}

/**
 * Shape of the event payload
 *
 * @internal
 */
export interface EventPayload {
  readonly n: string
  readonly u: Location['href']
  readonly d: Location['hostname']
  readonly r: Document['referrer'] | null
  readonly w: Window['innerWidth']
  readonly h: 1 | 0
  readonly p?: string
}
