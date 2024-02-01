import { sendEvent as _sendEvent, createEventData, isBlackListed, isFile, isUserExcludeItself } from './event'
import { isOutboundLink, shouldFollowLink } from './outbound-link'
import { createPayload } from './payload'
import { EventName, type EventOptions, type EventPayload, type PlausibleOptions } from './types'

export function createPlausibleTracker(initOptions?: Partial<PlausibleOptions>) {
  const protocol = location.protocol

  const defaultOptions: PlausibleOptions = {
    enabled: true,
    hashMode: false,
    domain: location.hostname,
    apiHost: 'https://plausible.io',
    blackListedDomains: ['localhost'],
    logIgnored: false,
  }

  // Options does not change later.
  const plausibleOptions = { ...defaultOptions, ...initOptions } satisfies PlausibleOptions

  const sendEvent = (payload: EventPayload, callback?: () => void) => _sendEvent(plausibleOptions.apiHost, payload, callback)

  /**
   * Send a custom event.
   *
   * @param eventName - The event name
   * @param options - The event options
   */
  function trackEvent(eventName: string, options?: EventOptions) {
    const data = createEventData(options?.data)
    const payload = createPayload(eventName, plausibleOptions, data, options)

    // Ignore events if the protocol is file, the hostname is blacklisted or the user exclude itself.
    if (isFile(protocol) || isBlackListed(plausibleOptions.domain, plausibleOptions.blackListedDomains) || isUserExcludeItself()) {
      // Only log ignored events if the option is enabled.
      if (!plausibleOptions.logIgnored)
        // eslint-disable-next-line no-console
        console.info(`[Plausible] ${eventName}`, payload)

      // Call the callback if it exists since we are not sending the event.
      options?.callback?.()
    }
    else {
      sendEvent(payload, options?.callback)
    }
  }

  /**
   * Send a pageview event.
   */
  function trackPageview(options?: EventOptions) {
    trackEvent(EventName.Pageview, options)
  }

  /**
   * Enable auto 'pageview' tracking.
   */
  function enableAutoPageviews(initOptions?: EventOptions) {
    const options: EventOptions = { ...initOptions }

    function page() {
      trackPageview(options)
    }

    // Attach pushState and popState listeners
    const originalPushState = history.pushState
    if (originalPushState) {
      history.pushState = function (...args) {
        originalPushState.apply(this, args)
        page()
      }
      window.addEventListener('popstate', page)
    }

    // Attach hashchange listener
    if (plausibleOptions.hashMode)
      window.addEventListener('hashchange', page)

    function setEventOptions(newOptions: EventOptions) {
      Object.assign(options, newOptions)
    }

    function cleanup() {
      if (originalPushState) {
        history.pushState = originalPushState
        window.removeEventListener('popstate', page)
      }
      if (plausibleOptions.hashMode)
        window.removeEventListener('hashchange', page)
    }

    // Initial pageview
    page()

    return {
      setEventOptions,
      cleanup,
    }
  }

  /**
   * Enable outbound link tracking.
   */
  function enableOutboundTracking() {
    const targetNode = document
    const observerInit: MutationObserverInit = {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    }

    /**
     * Callback of an event listener on an anchor element.
     *
     * @param this - The anchor element
     * @param event - The click event
     */
    function handleLinkClickEvent(this: HTMLAnchorElement, event: MouseEvent) {
      const location = window.location as (Location & string) as string
      // If not left click and not middle click, do nothing.
      if ((event.type === 'auxclick' && event.button !== 1) || !isOutboundLink(this, location))
        return

      // There is an href since it's an outbound link.
      const href = this.getAttribute('href')!

      // Avoid to retrigger a navigation if trackEvent callback is called but setTimeout trigger at the same time.
      let followedLink = false

      function followLink() {
        if (!followedLink) {
          followedLink = true
          window.location = href as (string & Location)
        }
      }

      const props = { url: href }
      if (shouldFollowLink(event, this)) {
        trackEvent(EventName.OutboundLink, { props, callback: followLink })
        // Fall back if the callback doesn't fire
        setTimeout(followLink, 1000)
        event.preventDefault()
      }
      else {
        trackEvent(EventName.OutboundLink, { props })
      }
    }

    const tracked = new Set<HTMLAnchorElement>()

    function addNode(node: Node | ParentNode) {
      if (node instanceof HTMLAnchorElement) {
        if (node.host !== location.host) {
          node.addEventListener('click', handleLinkClickEvent)
          node.addEventListener('auxclick', handleLinkClickEvent)
          tracked.add(node)
        }
      }
      else if ('querySelectorAll' in node) {
        node.querySelectorAll('a').forEach(addNode)
      }
    }

    function removeNode(node: Node | ParentNode) {
      if (node instanceof HTMLAnchorElement) {
        node.removeEventListener('click', handleLinkClickEvent)
        node.removeEventListener('auxclick', handleLinkClickEvent)
        tracked.delete(node)
      }
      else if ('querySelectorAll' in node) {
        node.querySelectorAll('a').forEach(removeNode)
      }
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          // Handle changed href
          removeNode(mutation.target)
          addNode(mutation.target)
        }
        else if (mutation.type === 'childList') {
          // Handle added nodes
          mutation.addedNodes.forEach(addNode)
          // Handle removed nodes
          mutation.removedNodes.forEach(removeNode)
        }
      })
    })

    // Track existing nodes
    targetNode.querySelectorAll('a').forEach(addNode)

    // Observe mutations
    observer.observe(targetNode, observerInit)

    function cleanup() {
      tracked.forEach((a) => {
        a.removeEventListener('click', handleLinkClickEvent)
        a.removeEventListener('auxclick', handleLinkClickEvent)
      })
      tracked.clear()
      observer.disconnect()
    };

    return {
      cleanup,
    }
  }

  return {
    trackEvent,
    trackPageview,
    enableAutoPageviews,
    enableOutboundTracking,
  }
}
