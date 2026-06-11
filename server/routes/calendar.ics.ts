import type { Match } from '../utils/match-source'
import { buildCalendarFeed } from '../utils/calendar-feed'

export default defineEventHandler(async (event) => {
  const { matchSourceUrl } = useRuntimeConfig(event)

  // GitHub raw serves text/plain, so fetch as text and parse explicitly.
  const raw = await $fetch<string>(matchSourceUrl, { responseType: 'text' })
  const matches = JSON.parse(raw) as Match[]

  setHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  return buildCalendarFeed(matches).toString()
})
