import Plausible from '@barbapapazes/plausible-tracker'

const plausible = Plausible({
  domain: 'example.com',
})

plausible.enableAutoPageviews()
