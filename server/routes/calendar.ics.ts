import { buildCalendarFeed } from '../utils/calendar-feed'
import { loadMatchSource } from '../utils/match-source'

export default defineEventHandler(async (event) => {
  const { matchSourceUrl, matchSourceTtlSeconds } = useRuntimeConfig(event)

  const matches = await loadMatchSource(matchSourceUrl, matchSourceTtlSeconds * 1000)

  setHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  // Let Vercel's edge absorb subscriber polling: fresh for the server-side
  // TTL, then serve stale while revalidating in the background.
  setHeader(
    event,
    'Cache-Control',
    `public, s-maxage=${matchSourceTtlSeconds}, stale-while-revalidate=86400`,
  )
  return buildCalendarFeed(matches).toString()
})
