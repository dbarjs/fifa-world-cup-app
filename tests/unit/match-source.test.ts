import { readFileSync } from 'node:fs'
import { MatchSource } from '#shared/schemas'
import { describe, expect, it } from 'vitest'

// Decoding the real Match Source through the schema is itself the validation:
// a bad manual edit fails here before it can reach the Calendar Feed. The
// per-Match shape (field formats, stage↔group consistency) is owned by the
// schema; this suite asserts the tournament-level facts a per-Match schema
// can't see — cardinality and cross-Match relationships.
const matches = MatchSource.parse(
  JSON.parse(readFileSync(new URL('../../data/matches.json', import.meta.url), 'utf8')),
)

const TOURNAMENT_START = Date.parse('2026-06-11T00:00:00Z')
const TOURNAMENT_END = Date.parse('2026-07-20T00:00:00Z')

describe('Match Source', () => {
  it('contains all 104 match numbers exactly once, in order', () => {
    expect(matches.map(m => m.matchNumber)).toEqual(
      Array.from({ length: 104 }, (_, i) => i + 1),
    )
  })

  it('has 72 group matches and 32 knockout matches across all stages', () => {
    const byStage = Object.groupBy(matches, m => m.stage)
    expect(byStage.group).toHaveLength(72)
    expect(byStage['round-of-32']).toHaveLength(16)
    expect(byStage['round-of-16']).toHaveLength(8)
    expect(byStage['quarter-final']).toHaveLength(4)
    expect(byStage['semi-final']).toHaveLength(2)
    expect(byStage['third-place-play-off']).toHaveLength(1)
    expect(byStage.final).toHaveLength(1)
  })

  it.each(matches)('match $matchNumber kicks off during the tournament', (match) => {
    const kickoff = match.kickoff.getTime()
    expect(kickoff).toBeGreaterThanOrEqual(TOURNAMENT_START)
    expect(kickoff).toBeLessThan(TOURNAMENT_END)
  })

  it('has exactly six matches in each of the twelve groups', () => {
    const byGroup = Object.groupBy(
      matches.filter(m => m.stage === 'group'),
      m => m.group!,
    )
    expect(Object.keys(byGroup).sort()).toEqual('ABCDEFGHIJKL'.split(''))
    for (const group of Object.values(byGroup))
      expect(group).toHaveLength(6)
  })

  it('knockout participants are Placeholder Pairings or qualified teams', () => {
    const placeholder = /^([12][A-L]|3[A-L](\/[A-L])+|[WL]\d{2,3})$/
    const teams = new Set(
      matches.filter(m => m.stage === 'group').flatMap(m => [m.home, m.away]),
    )
    expect(teams.size).toBe(48)
    for (const match of matches.filter(m => m.stage !== 'group')) {
      for (const side of [match.home, match.away]) {
        expect(
          placeholder.test(side) || teams.has(side),
          `match ${match.matchNumber}: "${side}" is neither bracket notation nor a qualified team`,
        ).toBe(true)
      }
    }
  })
})
