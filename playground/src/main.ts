import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'

const plausible = createPlausibleTracker()

plausible.enableAutoPageviews()
plausible.enableOutboundTracking()

document.getElementById('btn')?.addEventListener('click', () => {
  plausible.trackEvent('click', { props: { btn: 'btn' } })
})

// Use this to test the auto pageview tracking
document.getElementById('navigation')?.addEventListener('click', () => {
  const url = new URL(location.href)
  url.pathname = '/page2'
  window.history.pushState({}, '', url)
})
