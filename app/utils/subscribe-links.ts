import type { SubscribeLinks } from '#shared/schemas'

/**
 * Build Subscribe Links for the Calendar Feed from the origin that served
 * the page. Subscribe Links always subscribe — never a one-time import,
 * which would freeze the feed at click time (see CONTEXT.md).
 */
export function buildSubscribeLinks(origin: string | URL): SubscribeLinks {
  const { host } = new URL(origin)
  const feedUrl = `webcal://${host}/calendar.ics`
  return {
    feedUrl,
    apple: feedUrl,
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}`,
  }
}
