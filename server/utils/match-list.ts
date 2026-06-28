import type { Match, MatchWithTeams } from '#shared/schemas'
import { Temporal } from 'temporal-polyfill'
import { getTeamByCode } from './teams'

// Resolve each side's FIFA code to a Team — null for a Placeholder Pairing (e.g.
// "2A", "W73"), mirroring the calendar feed's sideLabel fallback — and order the
// Matches chronologically so a calendar reads top-to-bottom. Simultaneous
// kickoffs fall back to FIFA match number for a stable, deterministic order.
export function buildMatchList(matches: Match[]): MatchWithTeams[] {
  return matches
    .map(match => ({
      ...match,
      homeTeam: getTeamByCode(match.home) ?? null,
      awayTeam: getTeamByCode(match.away) ?? null,
    }))
    .sort((a, b) => Temporal.Instant.compare(a.kickoff, b.kickoff) || a.matchNumber - b.matchNumber)
}
