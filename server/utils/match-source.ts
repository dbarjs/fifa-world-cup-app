export type Stage =
  | 'group'
  | 'round-of-32'
  | 'round-of-16'
  | 'quarter-final'
  | 'semi-final'
  | 'third-place-play-off'
  | 'final'

export interface Match {
  /** Official FIFA match number, 1–104. */
  matchNumber: number
  stage: Stage
  /** Group letter (A–L) for group-stage matches, null otherwise. */
  group?: string | null
  /** Team name, or a Placeholder Pairing side in FIFA bracket notation (e.g. "2A", "W73"). */
  home: string
  away: string
  /** Kickoff in UTC, ISO 8601 with Z suffix. */
  kickoff: string
  venue: string
  city: string
  /** Fixtures only for now — always null until results are populated. */
  score: { home: number, away: number } | null
  /** Bumped on edits; drives the ICS SEQUENCE so clients replace the event. */
  revision: number
}

let cache: { matches: Match[], fetchedAt: number } | null = null

/**
 * Fetch the Match Source, caching it for `ttlMs` so subscriber polling does
 * not hammer raw.githubusercontent.com.
 *
 * Never resolves with an empty or partial Match Source: calendar clients keep
 * their last copy on an HTTP error but delete every event when handed an
 * empty feed. So on fetch or parse failure this serves the last cached data
 * (however stale) and only throws a 502 when there is nothing cached yet.
 */
export async function loadMatchSource(url: string, ttlMs: number): Promise<Match[]> {
  if (cache && Date.now() - cache.fetchedAt < ttlMs)
    return cache.matches

  try {
    // GitHub raw serves text/plain, so fetch as text and parse explicitly.
    // No retry: failing fast into the stale-cache fallback beats adding
    // latency during an outage, and the next request re-attempts anyway.
    const raw = await $fetch<string>(url, { responseType: 'text', retry: 0 })
    const matches = JSON.parse(raw) as Match[]
    if (!Array.isArray(matches) || matches.length === 0)
      throw new Error('Match Source is empty')
    cache = { matches, fetchedAt: Date.now() }
    return matches
  }
  catch (cause) {
    if (cache)
      return cache.matches
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      message: 'Match Source unavailable',
      cause,
    })
  }
}
