import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildCalendarFeed, matchUid } from '../../server/utils/calendar-feed'
import type { Match } from '../../server/utils/match-source'

const sample = JSON.parse(
  readFileSync(new URL('../../data/matches.json', import.meta.url), 'utf8'),
) as Match[]

/** Undo RFC 5545 line folding so assertions can match whole properties. */
function unfold(ics: string): string {
  return ics.replace(/\r\n[ \t]/g, '')
}

describe('buildCalendarFeed', () => {
  const ics = unfold(buildCalendarFeed(sample).toString())

  it('produces one VEVENT per Match', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(sample.length)
  })

  it('names the calendar', () => {
    expect(ics).toContain('X-WR-CALNAME:FIFA World Cup 2026')
  })

  it('derives stable UIDs from the FIFA match number', () => {
    expect(matchUid(sample[0]!)).toBe('wc2026-m1@fifa-world-cup-app')
    for (const match of sample)
      expect(ics).toContain(`UID:wc2026-m${match.matchNumber}@fifa-world-cup-app`)
  })

  it('titles group-stage matches with teams and group', () => {
    expect(ics).toContain('SUMMARY:Mexico vs South Africa — Group A')
  })

  it('renders a Placeholder Pairing in bracket notation', () => {
    expect(ics).toContain('SUMMARY:2A vs 2B — Round of 32')
  })

  it('keeps kickoff times in UTC with a 2h duration for group matches', () => {
    expect(ics).toContain('DTSTART:20260611T190000Z')
    expect(ics).toContain('DTEND:20260611T210000Z')
  })

  it('gives knockout matches a 3h duration', () => {
    expect(ics).toContain('DTSTART:20260628T190000Z')
    expect(ics).toContain('DTEND:20260628T220000Z')
  })

  it('sets description and location from match number, venue and city', () => {
    expect(ics).toContain('DESCRIPTION:Match 1 · Estadio Azteca\\, Mexico City')
    expect(ics).toContain('LOCATION:Estadio Azteca\\, Mexico City')
  })

  it('maps revision to SEQUENCE', () => {
    expect(ics).toContain('SEQUENCE:0')
    const bumped = unfold(buildCalendarFeed([{ ...sample[6]!, revision: 3 }]).toString())
    expect(bumped).toContain('SEQUENCE:3')
  })
})
