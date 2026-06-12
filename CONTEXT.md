# Context

Glossary of domain terms for the FIFA World Cup 2026 experiments app.

## Calendar Feed

A subscribable iCalendar (`.ics`) document generated on request, containing every
World Cup 2026 match as an event. Users subscribe to its URL in their calendar
client rather than downloading it once; the client re-fetches periodically.
Not to be confused with a static `.ics` file export.

## Subscribe Link

A URL that opens a calendar client's subscription flow for the Calendar Feed
(e.g. a `webcal://` link for Apple Calendar, or Google Calendar's add-by-URL
link). A Subscribe Link always subscribes — it never triggers a one-time
import or download, which would freeze the feed's contents at click time.

## Match

One of the 104 scheduled games of the FIFA World Cup 2026, identified by its
official FIFA match number (1–104). A Match always has a kickoff time, a venue,
and a stage; its participants may be unresolved (see Placeholder Pairing).

## Fixture

The scheduling facts of a Match: participants, kickoff time, venue, stage.
The Calendar Feed currently carries fixtures only — results (scores) are part
of the data model but not yet populated.

## Placeholder Pairing

A knockout-stage Match whose participants are not yet determined, expressed in
FIFA bracket notation (e.g. "1A vs 2B" — group winners/runners-up — or
"W73 vs W74" — winners of earlier matches). A Placeholder Pairing resolves to
named teams as the tournament progresses.

## Match Source

The single JSON file in this repository holding all 104 Matches. It is the
authoritative input to the Calendar Feed and is maintained by manual edits and
commits.

## Stage

The phase of the tournament a Match belongs to: group stage, round of 32,
round of 16, quarter-final, semi-final, third-place play-off, final.
