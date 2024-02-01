// @vitest-environment happy-dom

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendEvent } from './request'
import type { PlausibleOptions } from './tracker'

const defaultData: Required<PlausibleOptions> = {
  hashMode: false,
  trackLocalhost: false,
  url: 'https://my-app.com/my-url',
  domain: 'my-app.com',
  referrer: null,
  deviceWidth: 1080,
  apiHost: 'https://plausible.io',
}

describe('sendEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    globalThis.fetch = vi.fn().mockReturnValue({
      then: vi.fn(),
    })
    location.hostname = 'my-app.com'
  })

  it('sends default event', () => {
    expect(globalThis.fetch).not.toHaveBeenCalled()
    sendEvent('myEvent', defaultData)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${defaultData.apiHost}/api/event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          n: 'myEvent',
          u: 'https://my-app.com/my-url',
          d: 'my-app.com',
          r: null,
          w: 1080,
          h: 0,
          p: undefined,
        }),
      },
    )
  })

  it('hash mode', () => {
    sendEvent('myEvent', {
      ...defaultData,
      hashMode: true,
    })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${defaultData.apiHost}/api/event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          n: 'myEvent',
          u: 'https://my-app.com/my-url',
          d: 'my-app.com',
          r: null,
          w: 1080,
          h: 1,
          p: undefined,
        }),
      },
    )
  })

  it('does not send if localStorage.plausible_ignore is true', () => {
    localStorage.setItem('plausible_ignore', 'true')
    sendEvent('myEvent', defaultData)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('does not throw if localStorage is not available', () => {
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementationOnce(() => {
      throw new Error('localStorage is not available')
    })
    sendEvent('myEvent', defaultData)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  // TODO: test callback

  it('sends props', () => {
    sendEvent('myEvent', defaultData, {
      props: {
        myProp: 'myValue',
      },
    })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${defaultData.apiHost}/api/event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          n: 'myEvent',
          u: 'https://my-app.com/my-url',
          d: 'my-app.com',
          r: null,
          w: 1080,
          h: 0,
          p: '{"myProp":"myValue"}',
        }),
      },
    )
  })

  it('does not send to localhost', () => {
    location.hostname = 'localhost'
    sendEvent('myEvent', defaultData)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('send to localhost if trackLocalhost', () => {
    location.hostname = 'localhost'
    sendEvent('myEvent', {
      ...defaultData,
      trackLocalhost: true,
    })
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  describe('over file:', () => {
    beforeAll(() => {
      vi.spyOn(location, 'protocol', 'get').mockReturnValueOnce('file:')
    })

    it('does not send', () => {
      sendEvent('myEvent', defaultData)
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })
  })
})
