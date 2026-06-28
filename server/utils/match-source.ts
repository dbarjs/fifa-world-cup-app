import { MatchSource, type Match } from '#shared/schemas'
import { Temporal } from 'temporal-polyfill'

let cache: { matches: Match[], fetchedAt: Temporal.Instant } | null = null

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
  // Fresh while now is still before the cached copy's expiry instant.
  if (cache && Temporal.Instant.compare(Temporal.Now.instant(), cache.fetchedAt.add({ milliseconds: ttlMs })) < 0)
    return cache.matches

  try {
    // GitHub raw serves text/plain, so fetch as text and parse explicitly.
    // No retry: failing fast into the stale-cache fallback beats adding
    // latency during an outage, and the next request re-attempts anyway.
    const raw = await $fetch<string>(url, { responseType: 'text', retry: 0 })
    // Validate the whole source at the boundary: any invalid Match rejects it
    // all and we fall back to stale, never a partial feed (see ADR-0001). The
    // schema also subsumes the non-empty check and decodes kickoff to an Instant.
    const result = MatchSource.safeParse(JSON.parse(raw))
    if (!result.success) {
      // The failure is invisible to subscribers (they keep the stale feed), so
      // log it — otherwise a bad upstream sync hides behind a working feed.
      console.error('Match Source failed validation', result.error.issues)
      throw new Error('Match Source is invalid')
    }
    cache = { matches: result.data, fetchedAt: Temporal.Now.instant() }
    return result.data
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
