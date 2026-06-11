import type { AddressInfo } from 'node:net'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, describe, expect, it } from 'vitest'

// Stub GitHub raw with a switchable failure mode so each caching and
// failure path can be exercised against the same running server.
// Test order matters: the route's cache is warmed as the suite progresses.
const sample = readFileSync(new URL('../../data/matches.json', import.meta.url), 'utf8')
const TTL_SECONDS = 3

let failing = true
let upstreamRequests = 0
const stub = createServer((_req, res) => {
  upstreamRequests++
  if (failing) {
    res.statusCode = 500
    res.end('GitHub is down')
    return
  }
  res.setHeader('content-type', 'text/plain; charset=utf-8')
  res.end(sample)
})
await new Promise<void>(resolve => stub.listen(0, '127.0.0.1', resolve))
const stubUrl = `http://127.0.0.1:${(stub.address() as AddressInfo).port}/matches.json`

afterAll(() => new Promise<void>((resolve, reject) =>
  stub.close(err => err ? reject(err) : resolve()),
))

await setup({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
  nuxtConfig: {
    runtimeConfig: { matchSourceUrl: stubUrl, matchSourceTtlSeconds: TTL_SECONDS },
  },
})

describe('GET /calendar.ics caching and failure semantics', () => {
  it('returns an HTTP error on a cold cache, never an empty calendar', async () => {
    const response = await fetch('/calendar.ics')
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('BEGIN:VCALENDAR')
  })

  it('serves the feed with edge cache headers once the fetch succeeds', async () => {
    failing = false
    const response = await fetch('/calendar.ics')
    expect(response.status).toBe(200)

    const cacheControl = response.headers.get('cache-control')
    expect(cacheControl).toContain(`s-maxage=${TTL_SECONDS}`)
    expect(cacheControl).toContain('stale-while-revalidate=86400')

    const body = await response.text()
    expect(body.match(/BEGIN:VEVENT/g)).toHaveLength(104)
  })

  it('answers repeated requests within the TTL from cache, with one upstream fetch', async () => {
    const before = upstreamRequests
    for (let i = 0; i < 3; i++) {
      const response = await fetch('/calendar.ics')
      expect(response.status).toBe(200)
    }
    expect(upstreamRequests).toBe(before)
  })

  it('serves the stale cached feed when the refresh after TTL expiry fails', async () => {
    failing = true
    await new Promise(resolve => setTimeout(resolve, TTL_SECONDS * 1000 + 300))

    const before = upstreamRequests
    const response = await fetch('/calendar.ics')
    // The route must have re-attempted upstream and fallen back to the
    // cached Match Source — not merely answered from a still-fresh cache.
    expect(upstreamRequests).toBe(before + 1)
    expect(response.status).toBe(200)
    const body = await response.text()
    expect(body.match(/BEGIN:VEVENT/g)).toHaveLength(104)
  })
})
