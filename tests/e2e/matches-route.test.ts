import type { AddressInfo } from 'node:net'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, describe, expect, it } from 'vitest'

// Stub GitHub raw: serve the committed Match Source as text/plain,
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

describe('GET /api/matches', () => {
  it('serves every Match as JSON, ordered by kickoff with Teams resolved', async () => {
    const response = await fetch('/api/matches')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')

    const body = await response.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(104)

    // Sorted by kickoff ascending — the opening match (Match 1) kicks off first.
    const kickoffs = body.map((m: { kickoff: string }) => new Date(m.kickoff).getTime())
    expect(kickoffs).toEqual([...kickoffs].sort((a, b) => a - b))
    expect(body[0].matchNumber).toBe(1)
    expect(body[0].homeTeam).toMatchObject({ code: 'MEX', name: 'Mexico' })

    // A Placeholder Pairing stays unresolved: raw code kept, no Team. Match 89
    // (round of 16) is still pending once the earlier rounds have been synced.
    const m89 = body.find((m: { matchNumber: number }) => m.matchNumber === 89)
    expect(m89.home).toBe('W74')
    expect(m89.homeTeam).toBeNull()
    expect(m89.awayTeam).toBeNull()
  })
})
