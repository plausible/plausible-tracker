import type { EventOptions, Plausible } from '../index'
import { isOutboundLink, openLink, shouldFollowLink } from './utils'

export function useAutoOutboundTracking(plausible: Plausible, initOptions?: EventOptions) {
  const options: EventOptions = { ...initOptions }
  const tracked = new Set<HTMLAnchorElement>()

  function setEventOptions(newOptions: EventOptions) {
    Object.assign(options, newOptions)
  }

  /**
   * Callback of an event listener on an anchor element.
   */
  function handleLinkClickEvent(
    /** The anchor element */
    this: HTMLAnchorElement,
    /** The click event */
    event: MouseEvent,
  ) {
    const location = window.location as (Location & string) as string
    // If not left click and not middle click, do nothing.
    if ((event.type === 'auxclick' && event.button !== 1) || !isOutboundLink(this, location))
      return

    // There is an href since it's an outbound link.
    const href = this.getAttribute('href')!

    // Avoid to retrigger a navigation if `trackEvent` callback is called but `setTimeout` trigger at the same time.
    let followedLink = false

    // Use arrow function to keep the context of `this` as the anchor element.
    const followLink = () => {
      if (!followedLink) {
        followedLink = true
        openLink(this)
      }
    }

    const props = { url: href }
    if (shouldFollowLink(event, this)) {
      plausible.trackEvent('Outbound Link: Click', { props, callback: followLink })
      // Fall back if the callback doesn't fire
      setTimeout(followLink, 1000)
      event.preventDefault()
    }
    else {
      plausible.trackEvent('Outbound Link: Click', { props })
    }
  }

  /**
   * Add the event listeners to the node.
   */
  function addNode(
    /** The node to add */
    node: Node | ParentNode,
  ) {
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

  /**
   * Remove the event listeners from the node.
   */
  function removeNode(
    /** The node to remove */
    node: Node | ParentNode,
  ) {
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

  /**
   * Install the event listeners and the mutation observer.
   */
  function install() {
    const targetNode = document
    const observerInit: MutationObserverInit = {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    }

    // Track existing nodes
    targetNode.querySelectorAll('a').forEach(addNode)

    // Observe mutations
    observer.observe(targetNode, observerInit)
  }

  /**
   * Cleanup the event listeners and the mutation observer.
   */
  function cleanup() {
    tracked.forEach((a) => {
      a.removeEventListener('click', handleLinkClickEvent)
      a.removeEventListener('auxclick', handleLinkClickEvent)
    })
    tracked.clear()
    observer.disconnect()
  };

  return {
    install,
    cleanup,
    setEventOptions,
  }
}
