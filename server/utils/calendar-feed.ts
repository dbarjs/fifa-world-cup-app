import type { ICalCalendar } from 'ical-generator'
import ical from 'ical-generator'
import type { Match, Stage } from './match-source'

const KNOCKOUT_STAGE_LABELS: Record<Exclude<Stage, 'group'>, string> = {
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  'quarter-final': 'Quarter-final',
  'semi-final': 'Semi-final',
  'third-place-play-off': 'Third-place play-off',
  'final': 'Final',
}

const GROUP_DURATION_MS = 2 * 60 * 60 * 1000
// Knockouts reserve extra time and penalties.
const KNOCKOUT_DURATION_MS = 3 * 60 * 60 * 1000

function stageLabel(match: Match): string {
  if (match.stage === 'group')
    return `Group ${match.group}`
  return KNOCKOUT_STAGE_LABELS[match.stage]
}

export function matchUid(match: Match): string {
  return `wc2026-m${match.matchNumber}@fifa-world-cup-app`
}

export function buildCalendarFeed(matches: Match[]): ICalCalendar {
  const calendar = ical({ name: 'FIFA World Cup 2026' })

  for (const match of matches) {
    const start = new Date(match.kickoff)
    const durationMs = match.stage === 'group' ? GROUP_DURATION_MS : KNOCKOUT_DURATION_MS
    const location = `${match.venue}, ${match.city}`

    calendar.createEvent({
      id: matchUid(match),
      sequence: match.revision,
      start,
      end: new Date(start.getTime() + durationMs),
      summary: `${match.home} vs ${match.away} — ${stageLabel(match)}`,
      description: `Match ${match.matchNumber} · ${location}`,
      location,
    })
  }

  return calendar
}
