import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Match, Stage } from '../../server/utils/match-source'

// Schema validation over the real Match Source, so a bad manual edit
// cannot silently break the Calendar Feed.
const matches = JSON.parse(
  readFileSync(new URL('../../data/matches.json', import.meta.url), 'utf8'),
) as Match[]

const STAGES: Stage[] = [
  'group',
  'round-of-32',
  'round-of-16',
  'quarter-final',
  'semi-final',
  'third-place-play-off',
  'final',
]

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

  it.each(matches)('match $matchNumber is a valid fixture', (match) => {
    expect(STAGES).toContain(match.stage)

    if (match.stage === 'group') {
      expect(match.group).toMatch(/^[A-L]$/)
      // six matches per group
      expect(matches.filter(m => m.group === match.group)).toHaveLength(6)
    }
    else {
      expect(match.group).toBeNull()
    }

    for (const field of ['home', 'away', 'venue', 'city'] as const) {
      expect(match[field]).toBeTypeOf('string')
      expect(match[field].length).toBeGreaterThan(0)
    }

    expect(match.kickoff).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    const kickoff = Date.parse(match.kickoff)
    expect(kickoff).toBeGreaterThanOrEqual(TOURNAMENT_START)
    expect(kickoff).toBeLessThan(TOURNAMENT_END)

    if (match.score !== null) {
      expect(match.score.home).toBeTypeOf('number')
      expect(match.score.away).toBeTypeOf('number')
    }

    expect(Number.isInteger(match.revision)).toBe(true)
    expect(match.revision).toBeGreaterThanOrEqual(0)
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
