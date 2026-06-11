import type { AddressInfo } from 'node:net'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, describe, expect, it } from 'vitest'

// Stub GitHub raw: serve the committed sample Match Source as text/plain,
// exactly like raw.githubusercontent.com does.
const sample = readFileSync(new URL('../../data/matches.json', import.meta.url), 'utf8')
const stub = createServer((_req, res) => {
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
    runtimeConfig: { matchSourceUrl: stubUrl },
  },
})

describe('GET /calendar.ics', () => {
  it('serves a parseable Calendar Feed built from the Match Source', async () => {
    const response = await fetch('/calendar.ics')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/calendar')
    expect(response.headers.get('content-type')).toContain('charset=utf-8')

    const body = await response.text()
    const unfolded = body.replace(/\r\n[ \t]/g, '')

    expect(unfolded).toMatch(/^BEGIN:VCALENDAR\r\n/)
    expect(unfolded.trimEnd()).toMatch(/END:VCALENDAR$/)
    expect(unfolded).toContain('VERSION:2.0')
    expect(unfolded.match(/BEGIN:VEVENT/g)).toHaveLength(7)
    expect(unfolded.match(/END:VEVENT/g)).toHaveLength(7)
    expect(unfolded).toContain('UID:wc2026-m73@fifa-world-cup-app')
    expect(unfolded).toContain('SUMMARY:2A vs 2B — Round of 32')
  })
})
