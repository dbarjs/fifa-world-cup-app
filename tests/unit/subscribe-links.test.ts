import { describe, expect, it } from 'vitest'
import { buildSubscribeLinks } from '../../app/utils/subscribe-links'

describe('buildSubscribeLinks', () => {
  it('turns the origin into a webcal:// feed URL', () => {
    const links = buildSubscribeLinks('https://example.com')
    expect(links.feedUrl).toBe('webcal://example.com/calendar.ics')
  })

  it('keeps a non-standard port', () => {
    const links = buildSubscribeLinks('http://localhost:3000')
    expect(links.feedUrl).toBe('webcal://localhost:3000/calendar.ics')
  })

  it('uses the webcal URL as the Apple Subscribe Link', () => {
    const links = buildSubscribeLinks('https://example.com')
    expect(links.apple).toBe(links.feedUrl)
  })

  it('URL-encodes the webcal URL inside Google\'s cid parameter', () => {
    const links = buildSubscribeLinks('https://example.com')
    expect(links.google).toBe(
      'https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fexample.com%2Fcalendar.ics',
    )
    // The raw scheme separator must not leak into the query string.
    expect(links.google).not.toContain('cid=webcal://')
  })

  it('drops any path or query from the origin', () => {
    const links = buildSubscribeLinks('https://example.com/some/page?q=1')
    expect(links.feedUrl).toBe('webcal://example.com/calendar.ics')
  })
})
