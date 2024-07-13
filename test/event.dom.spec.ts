import { describe, it, expect, vi, beforeEach } from "vitest";
import { isUserSelfExcluded, createEventData, sendEvent } from '../src/event'

describe('`isUserSelfExcluded`', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return `true` if the key `plausible_ignore` is set to \'true\'', () => {
    localStorage.setItem('plausible_ignore', 'true')

    expect(isUserSelfExcluded()).toBe(true)
  })

  it('should return `false` if the key `plausible_ignore` is not set', () => {
    expect(isUserSelfExcluded()).toBe(false)
  })
})

describe('`createEventData`', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // @ts-expect-error - Mocking the location object
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'http://example.com',
     })
     vi.spyOn(document, 'referrer', 'get').mockReturnValue('http://referrer.com')
     vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1920)
  })

  it('should use the href of the current location as the default URL', () => {
    const data = createEventData({
      referrer: 'http://referrer.com',
      deviceWidth: 1920,
    })

    expect(data).toEqual({
      url: 'http://example.com',
      referrer: 'http://referrer.com',
      deviceWidth: 1920,
    })
  })

  it('should use the referrer of the document as the default referrer', () => {
    const data = createEventData({
      url: 'http://example.com',
      deviceWidth: 1920,
    })

    expect(data).toEqual({
      url: 'http://example.com',
      referrer: 'http://referrer.com',
      deviceWidth: 1920,
    })
  })

  it('should use the inner width of the window as the default device width', () => {
    const data = createEventData({
      url: 'http://example.com',
      referrer: 'http://referrer.com',
    })

    expect(data).toEqual({
      url: 'http://example.com',
      referrer: 'http://referrer.com',
      deviceWidth: 1920,
    })
  })
})

describe('`sendEvent`', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(window, 'fetch').mockResolvedValue({} as Response)
  })

  it('should send an event with the payload to the API `/api/event`', async () => {
    await sendEvent('https://example.com', {
      n: 'test',
      u: 'http://example.com',
      d: 'example.com',
      r: 'http://referrer.com',
      w: 1920,
      h: 0,
    })

    expect(window.fetch).toHaveBeenCalledWith('https://example.com/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        n: 'test',
        u: 'http://example.com',
        d: 'example.com',
        r: 'http://referrer.com',
        w: 1920,
        h: 0,
      }),
    })
  })

  it('should call the callback after the event is sent', async () => {
    const callback = vi.fn()

    await sendEvent('https://example.com', {
      n: 'test',
      u: 'http://example.com',
      d: 'example.com',
      r: 'http://referrer.com',
      w: 1920,
      h: 0,
    }, callback)

    expect(callback).toHaveBeenCalled()
  })
})
