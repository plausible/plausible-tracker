import Plausible from '@barbapapazes/plausible-tracker'

const plausible = Plausible({
  domain: 'example.com',
})

plausible.enableAutoPageviews()

plausible.trackEvent('test', {
  props: {
    test: 'test',
  },
  callback: () => console.log('test'),
})
