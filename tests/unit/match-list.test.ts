import { readFileSync } from 'node:fs'
import { MatchSource } from '#shared/schemas'
import { describe, expect, it } from 'vitest'
import { buildMatchList } from '../../server/utils/match-list'

// Decode through the schema so kickoff is a real Temporal.Instant, exactly as
// the route hands it to buildMatchList.
const sample = MatchSource.parse(
  JSON.parse(readFileSync(new URL('../../data/matches.json', import.meta.url), 'utf8')),
)

describe('buildMatchList', () => {
  const list = buildMatchList(sample)

  it('returns every Match', () => {
    expect(list).toHaveLength(sample.length)
  })

  it('orders Matches by kickoff ascending', () => {
    for (let i = 1; i < list.length; i++)
      expect(list[i]!.kickoff.epochMilliseconds).toBeGreaterThanOrEqual(list[i - 1]!.kickoff.epochMilliseconds)
  })

  it('breaks simultaneous kickoffs by FIFA match number', () => {
    for (let i = 1; i < list.length; i++) {
      if (list[i]!.kickoff.epochMilliseconds === list[i - 1]!.kickoff.epochMilliseconds)
        expect(list[i]!.matchNumber).toBeGreaterThan(list[i - 1]!.matchNumber)
    }
  })

  it('resolves a group-stage Match to its Teams', () => {
    const m1 = list.find(m => m.matchNumber === 1)!
    expect(m1.home).toBe('MEX')
    expect(m1.homeTeam).toMatchObject({ code: 'MEX', name: 'Mexico' })
    expect(m1.awayTeam).toMatchObject({ code: 'RSA', name: 'South Africa' })
  })

  it('leaves a Placeholder Pairing unresolved — null Teams, raw code kept', () => {
    // Match 89 (round of 16) is still a Placeholder Pairing once the earlier
    // rounds have been synced — its winners are not yet known.
    const m89 = list.find(m => m.matchNumber === 89)!
    expect(m89.home).toBe('W74')
    expect(m89.away).toBe('W77')
    expect(m89.homeTeam).toBeNull()
    expect(m89.awayTeam).toBeNull()
  })
})
