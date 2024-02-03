import type { EventOptions, Plausible } from '../index'

export function useAutoPageviews(plausible: Plausible, initOptions?: EventOptions) {
  const options: EventOptions = { ...initOptions }

  function setEventOptions(newOptions: EventOptions) {
    Object.assign(options, newOptions)
  }

  /**
   * Encapsulate the pageview event to allow user to update the options at any time
   */
  function page() {
    plausible.trackPageview(options)
  }

  const originalPushState = history.pushState

  function install() {
    if (originalPushState) {
      history.pushState = function (...args) {
        originalPushState.apply(this, args)
        page()
      }
      window.addEventListener('popstate', page)
    }

    if (plausible.options.hashMode)
      window.addEventListener('hashchange', page)

    // Initial pageview
    page()
  }

  function cleanup() {
    if (originalPushState) {
      history.pushState = originalPushState
      window.removeEventListener('popstate', page)
    }
    if (plausible.options.hashMode)
      window.removeEventListener('hashchange', page)
  }

  return {
    install,
    cleanup,
    setEventOptions,
  }
}
