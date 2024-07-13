import { describe, it, expect } from 'vitest'
import { createPayload } from '../src/payload'
import { PlausibleOptions } from '../src/types'

describe('payload', () => {
  const plausibleOptions: Required<PlausibleOptions> = {
    domain: 'example.com',
    hashMode: false,
    apiHost: 'https://example.com',
    enabled: true,
    ignoredHostnames: [],
    ignoreSubDomains: false,
    logIgnored: false,
  }
  const data = {
    url: 'http://example.com',
    referrer: 'http://referrer.com',
    deviceWidth: 1920
  }

  it('should be correctly formed', () => {
    const payload = createPayload('test', plausibleOptions, data)

    expect(payload).toEqual({
      n: 'test',
      u: 'http://example.com',
      d: 'example.com',
      r: 'http://referrer.com',
      w: 1920,
      h: 0,
      p: undefined
    })
  })

  it('should include props', () => {
    const payload = createPayload('test', plausibleOptions, data, { props: { key: 'value' } })

    expect(payload).toEqual({
      n: 'test',
      u: 'http://example.com',
      d: 'example.com',
      r: 'http://referrer.com',
      w: 1920,
      h: 0,
      p: '{"key":"value"}'
    })
  })

  it('should transform `hashMode` to `1` when enabled', () => {
    const payload = createPayload('test', { ...plausibleOptions, hashMode: true }, data)

    expect(payload).toEqual({
      n: 'test',
      u: 'http://example.com',
      d: 'example.com',
      r: 'http://referrer.com',
      w: 1920,
      h: 1,
      p: undefined
    })
  })
})
