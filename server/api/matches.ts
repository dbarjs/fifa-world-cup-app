import { buildMatchList } from '../utils/match-list'
import { loadMatchSource } from '../utils/match-source'

// Every Match as JSON for the calendar view: the Match Source, fetched, validated
// and cached exactly like the Calendar Feed, with each side resolved to a Team and
// ordered by kickoff. Returns an array; Nitro serializes it as application/json.
export default defineEventHandler(async (event) => {
  const { matchSourceUrl, matchSourceTtlSeconds } = useRuntimeConfig(event)

  const matches = await loadMatchSource(matchSourceUrl, matchSourceTtlSeconds * 1000)

  // Mirror the Calendar Feed: let the edge absorb polling — fresh for the
  // server-side TTL, then serve stale while revalidating in the background.
  setHeader(
    event,
    'Cache-Control',
    `public, s-maxage=${matchSourceTtlSeconds}, stale-while-revalidate=86400`,
  )
  return buildMatchList(matches)
})
