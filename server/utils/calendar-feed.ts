import type { ICalCalendar } from 'ical-generator'
import type { Match, Stage } from '#shared/schemas'
import ical from 'ical-generator'
import { Temporal } from 'temporal-polyfill'
import { getTeamByCode } from './teams'

const KNOCKOUT_STAGE_LABELS: Record<Exclude<Stage, 'group'>, string> = {
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  'quarter-final': 'Quarter-final',
  'semi-final': 'Semi-final',
  'third-place-play-off': 'Third-place play-off',
  'final': 'Final',
}

const GROUP_DURATION = Temporal.Duration.from({ hours: 2 })
// Knockouts reserve extra time and penalties.
const KNOCKOUT_DURATION = Temporal.Duration.from({ hours: 3 })

function stageLabel(match: Match): string {
  if (match.stage === 'group')
    return `Group ${match.group}`
  return KNOCKOUT_STAGE_LABELS[match.stage]
}

// home/away hold a FIFA team code; resolve it to the Team's display name. A
// Placeholder Pairing (e.g. "2A", "W73") has no Team, so fall back to the raw
// bracket notation — exactly what subscribers should see until it resolves.
function sideLabel(side: string): string {
  return getTeamByCode(side)?.name ?? side
}

// Event title: the pairing before kickoff, the scoreline once a Result exists.
// A bumped revision (SEQUENCE) is what makes clients replace the title in place.
function summaryLabel(match: Match): string {
  const home = sideLabel(match.home)
  const away = sideLabel(match.away)
  const pairing = match.score
    ? `${home} ${match.score.home}–${match.score.away} ${away}`
    : `${home} vs ${away}`
  return `${pairing} — ${stageLabel(match)}`
}

export function matchUid(match: Match): string {
  return `wc2026-m${match.matchNumber}@fifa-world-cup-app`
}

export function buildCalendarFeed(matches: Match[]): ICalCalendar {
  const calendar = ical({ name: 'FIFA World Cup 2026' })

  for (const match of matches) {
    // kickoff is already decoded to a Temporal.Instant by the Match Source
    // schema; ical-generator accepts an Instant directly (see ADR-0004).
    const start = match.kickoff
    const duration = match.stage === 'group' ? GROUP_DURATION : KNOCKOUT_DURATION
    const location = `${match.venue}, ${match.city}`

    calendar.createEvent({
      id: matchUid(match),
      sequence: match.revision,
      start,
      end: start.add(duration),
      summary: summaryLabel(match),
      description: `Match ${match.matchNumber} · ${location}`,
      location,
    })
  }

  return calendar
}
