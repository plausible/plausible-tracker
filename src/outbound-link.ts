/**
 * Inspired by official Plausible Tracker.
 * @see https://github.com/plausible/analytics/blob/master/tracker/src/customEvents.js#L77
 */

/**
 * Determine if a link is an outbound link.
 *
 * @param link - The link
 * @param currentHostname - The current hostname
 * @returns - If the link is an outbound link
 */
export function isOutboundLink(link: HTMLAnchorElement, currentHostname: string) {
  return link.href && link.host && link.host !== currentHostname
}

/**
 * Check if the link should be followed (i.e. not prevented by an external script or using blank target).
 *
 * @param event - Mouse event
 * @param link - Link
 * @returns - If the link should be followed
 */
export function shouldFollowLink(event: MouseEvent, link: HTMLAnchorElement) {
  // If default has been prevented by an external script, Plausible should not intercept navigation.
  if (event.defaultPrevented)
    return false

  const targetsCurrentWindow = !link.target || link.target.match(/^_(self|parent|top)$/i)
  const isRegularClick = !(event.ctrlKey || event.metaKey || event.shiftKey) && event.type === 'click'

  return targetsCurrentWindow && isRegularClick
}
