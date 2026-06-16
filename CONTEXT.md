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

## Team

A national team competing in the tournament — a Match's participant, once
resolved. Identified by its FIFA trigramme (e.g. MEX, ENG). A Team is distinct
from a country: most Teams map to an ISO 3166-1 country, from which a flag is
derived, but FIFA's home-nation teams — England, Scotland — have no ISO 3166-1
country. The unresolved sides of a Placeholder Pairing are not yet Teams.

## Fixture

The scheduling facts of a Match: participants, kickoff time, venue, stage.

## Result

The final score of a Match once it has been played, held as `score`. Unplayed
Matches have no Result. The Calendar Feed carries both Fixtures and Results: a
Match's event shows the pairing before kickoff and the score once a Result
exists.

## Placeholder Pairing

A knockout-stage Match whose participants are not yet determined, expressed in
FIFA bracket notation (e.g. "1A vs 2B" — group winners/runners-up — or
"W73 vs W74" — winners of earlier matches). A Placeholder Pairing resolves to
Teams as the tournament progresses.

## Match Source

The single JSON file in this repository holding all 104 Matches. It is the
authoritative input to the Calendar Feed. Its structure (the 104 Matches and
their FIFA match numbers) is fixed by hand; its field values are kept current by
syncing from an Upstream Fixture Source, reviewed, then committed.

## Upstream Fixture Source

The external, public record of World Cup 2026 fixtures and results (Wikipedia)
from which a Match's field values — resolved participants, kickoff, venue, city,
and Result — are synced into the Match Source. The Upstream Fixture Source never
defines the Match Source's structure: it only fills and corrects field values on
the Matches that already exist, matched by FIFA match number.

## Stage

The phase of the tournament a Match belongs to: group stage, round of 32,
round of 16, quarter-final, semi-final, third-place play-off, final.
