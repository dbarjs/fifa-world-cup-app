import { readFileSync } from 'node:fs'
import { MatchSource } from '#shared/schemas'
import { hasFlag } from 'country-flag-icons'
import { describe, expect, it } from 'vitest'
import { getTeamByCode, teams } from '../../server/utils/teams'

// Parsing teams.json through the Teams schema happens in teams.ts at import;
// reaching this file at all means the Team Reference is structurally valid.
const allTeams = Object.values(teams)

const matches = MatchSource.parse(
  JSON.parse(readFileSync(new URL('../../data/matches.json', import.meta.url), 'utf8')),
)

// A Placeholder Pairing side, e.g. "2A" or "W73" — not a Team code.
const placeholder = /^([12][A-L]|3[A-L](\/[A-L])+|[WL]\d{2,3})$/

describe('Team Reference', () => {
  it('keys every Team by its own FIFA code', () => {
    for (const [key, team] of Object.entries(teams))
      expect(key).toBe(team.code)
  })

  it('only carries country codes that country-flag-icons can render', () => {
    // Catches alpha-2 typos against the real flag library, so a bad countryCode
    // surfaces here rather than as a missing flag in a consumer.
    for (const team of allTeams) {
      if (team.countryCode !== undefined) {
        expect(
          hasFlag(team.countryCode),
          `${team.code} (${team.name}): "${team.countryCode}" has no flag`,
        ).toBe(true)
      }
    }
  })

  it('resolves every named Match side to a Team (the code-join holds)', () => {
    // Every home/away in the Match Source is either a resolvable Team code or a
    // Placeholder Pairing — nothing falls through the join.
    for (const match of matches) {
      for (const side of [match.home, match.away]) {
        expect(
          getTeamByCode(side) !== undefined || placeholder.test(side),
          `match ${match.matchNumber}: "${side}" is neither a Team code nor a Placeholder Pairing`,
        ).toBe(true)
      }
    }
  })

  it('returns undefined for a Placeholder Pairing or unknown code', () => {
    expect(getTeamByCode('2A')).toBeUndefined()
    expect(getTeamByCode('W73')).toBeUndefined()
    expect(getTeamByCode('ZZZ')).toBeUndefined()
  })
})
