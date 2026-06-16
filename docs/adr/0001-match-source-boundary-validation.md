---
status: accepted
---

# Validate the Match Source at the request boundary, all-or-nothing

The Calendar Feed is built from the Match Source, fetched at request time from a
raw GitHub URL and previously trusted via an unchecked `JSON.parse(...) as Match[]`
cast. We now validate it through a zod schema (`MatchSource`) at that boundary: on
any validation failure we serve the last good cached copy (or 502 if nothing is
cached), exactly as we already do for a fetch failure — never a partial or empty
feed. Validation is whole-source: if a single Match fails the schema, the entire
source is rejected.

## Considered options

- **All-or-nothing (chosen).** One `safeParse` over the whole array; any invalid
  Match rejects the source and we fall back to stale.
- **Element-wise** — drop invalid Matches and build the feed from the survivors.
  Rejected: a feed missing Matches makes calendar clients *delete* those events
  from subscribers' calendars. A stale-but-complete 104 is always better than a
  fresh-but-shrunk feed, and the Match Source is hand-curated and reviewed, so a
  schema failure signals an escaped bad edit we want surfaced, not silently
  patched.

## Consequences

- A validation failure is invisible to subscribers (they keep the last good
  feed), so it is logged via `console.error` — otherwise a bad upstream sync
  hides behind a working-looking feed.
- The schema is strict by design (no per-field `.catch()`); a malformed hand-edit
  is rejected rather than coerced. The only tolerance is `score` defaulting to
  `null` (an absent score means an unplayed Match).
