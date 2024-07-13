import { describe, it, expect } from 'vitest'
import { isFile, isIgnored, isUserSelfExcluded, createEventData } from '../src/event'

describe('`isFile`', () => {
  it('should return true if the protocol is `file:`', () => {
    expect(isFile('file:')).toBe(true)
  })

  it.each([
    ['http'],
    ['https:'],
    ['ftp:'],
    ['ws:'],
    ['wss:'],
    ['data:'],
    ['blob:'],
    ['mailto:'],
  ])('should return false if the protocol is `%s`', (protocol) => {
    expect(isFile(protocol)).toBe(false)
  })
})

describe('`isIgnored`', () => {
  it('should return true if the hostname is ignored', () => {
    expect(isIgnored('example.com', ['example.com'], false)).toBe(true)
  })

  it('should return false if the hostname is not ignored', () => {
    expect(isIgnored('example.com', ['example.org'], false)).toBe(false)
  })

  it('should not ignore subdomains', () => {
    expect(isIgnored('sub.example.com', ['example.com'], false)).toBe(false)
  })

  it('should ignore subdomains if the option is enabled', () => {
    expect(isIgnored('sub.example.com', ['example.com'], true)).toBe(true)
  })
})

describe('`isUserSelfExcluded`', () => {
  it('should return false if `localStorage` is not available', () => {
    expect(isUserSelfExcluded()).toBe(false)
  })
})

describe('`createEventData`', () => {
  it('should create a valid event data', () => {
    const data = createEventData({
      url: 'http://example.com',
      referrer: 'http://referrer.com',
      deviceWidth: 1920,
    })

    expect(data).toEqual({
      url: 'http://example.com',
      referrer: 'http://referrer.com',
      deviceWidth: 1920,
    })
  })
})
