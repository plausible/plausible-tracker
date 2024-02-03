import type { EventOptions, Plausible } from '../index'
import { openLink, shouldFollowLink } from './utils'

export interface AutoFileDownloadsTrackingOptions {
  /**
   * File types to track.
   */
  fileTypes: string[]
}

/**
 * Default file types to track.
 * @see https://plausible.io/docs/file-downloads-tracking#which-file-types-are-tracked
 */
export const defaultFileTypes = ['pdf', 'xlsx', 'docx', 'txt', 'rtf', 'csv', 'exe', 'key', 'pps', 'ppt', 'pptx', '7z', 'pkg', 'rar', 'gz', 'zip', 'avi', 'mov', 'mp4', 'mpeg', 'wmv', 'midi', 'mp3', 'wav', 'wma']

export function useAutoFileDownloadsTracking(plausible: Plausible, extensionOptions: AutoFileDownloadsTrackingOptions, initOptions?: EventOptions) {
  const fileTypes = extensionOptions.fileTypes
  const options: EventOptions = { ...initOptions }
  const tracked = new Set<HTMLAnchorElement>()

  function setEventOptions(newOptions: EventOptions) {
    Object.assign(options, newOptions)
  }

  /**
   * Callback of an event listener on an anchor element.
   *
   * @param this - The anchor element
   * @param event - The click event
   */
  function handleLinkClickEvent(this: HTMLAnchorElement, event: MouseEvent) {
    // If not left click and not middle click, do nothing.
    if ((event.type === 'auxclick' && event.button !== 1))
      return

    const pathname = this.pathname
    if (!isDownloadToTrack(pathname, fileTypes))
      return

    // Avoid to retrigger a navigation if trackEvent callback is called but setTimeout trigger at the same time.
    let followedLink = false

    // Use arrow function to keep the context of `this` as the anchor element.
    const followLink = () => {
      if (!followedLink) {
        followedLink = true
        openLink(this)
      }
    }

    const props = { url: pathname }
    if (shouldFollowLink(event, this)) {
      plausible.trackEvent('File Download', { props, callback: followLink })
      // Fall back if the callback doesn't fire
      setTimeout(followLink, 1000)
      event.preventDefault()
    }
    else {
      plausible.trackEvent('File Download', { props })
    }
  }

  /**
   * Add the event listeners to the node.
   *
   * @param node - The node to add
   */
  function addNode(node: Node | ParentNode) {
    if (node instanceof HTMLAnchorElement) {
      // Downloaded files hosted on the same domain otherwise it's handled by the extension `useAutoOutboundTracking`.
      if (node.host === location.host) {
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
   *
   * @param node - The node to remove
   */
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

/**
 * Determine if a link is a download to track.
 */
function isDownloadToTrack(url: string, fileTypes: string[]) {
  if (!url)
    return false

  const fileType = url.split('.').pop()

  if (!fileType)
    return false

  return fileTypes.includes(fileType)
}
