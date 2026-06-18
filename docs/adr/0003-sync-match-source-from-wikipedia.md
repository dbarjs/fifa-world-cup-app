---
status: accepted
---

# Sync the Match Source from Wikipedia, file as spine, human-reviewed

The Match Source's field values were maintained purely by hand. We add a
`sync-match-source` skill that fills and corrects those values from Wikipedia
(the **Upstream Fixture Source**): it resolves Placeholder Pairings, corrects
`kickoff`/`venue`/`city`, and — newly — populates `score`. The skill stops at a
reviewable diff with tests passing; committing and pushing to `main` stays a
deliberate human step. This also brings **Results** into the product: the
Calendar Feed now renders a scoreline once a Match has a `score`, where before it
always showed `"X vs Y"` and `CONTEXT.md` declared the feed "fixtures only".

## Considered options

- **Upstream sync, file as spine, human-reviewed (chosen).** Our 104-Match file
  is authoritative for structure; Wikipedia only fills field values, matched by
  FIFA `matchNumber`. A value-vs-value diff bumps `revision` only where something
  changed, so re-runs are idempotent. The human diff-gate is the safety net for
  upstream flakiness and name-mapping mistakes before they reach subscribers.
- **Keep manual-only.** Rejected: resolving 32 knockout slots and entering 104
  scores by hand during a live tournament is the error-prone toil the skill
  removes — and it's exactly the kind of repetitive edit a `revision`/SEQUENCE
  mistake corrupts.
- **Treat Wikipedia as the spine** (rebuild the match list each run). Rejected: it
  puts `matchNumber` — the calendar event's identity — at the mercy of upstream
  markup, and a dropped Match would delete events from subscribers' calendars
  (see ADR-0001). The file must own the skeleton.
- **A structured football API instead of Wikipedia.** Rejected for now: free APIs
  don't reliably carry the official FIFA match numbering we anchor on, and a
  Claude-run skill can read Wikipedia with judgment. Revisit if a numbered,
  stable source appears.
- **A committed parser script** rather than skill instructions. Rejected: parsing
  Wikipedia and reconciling ambiguous rows is judgment-heavy and the markup
  shifts; a script is a brittle maintenance surface. The skill is instructions
  only, and `pnpm test` already validates the result.
- **Defer scores.** Rejected: the live tournament makes Results the most valuable
  thing to sync, and rendering them in the feed is a small, contained change.

## Consequences

- `CONTEXT.md` gains **Result** and **Upstream Fixture Source** and the feed is
  no longer "fixtures only"; `buildCalendarFeed` renders `"Mexico 2–1 South
  Africa — Group A"` when a `score` is present. A Result arriving bumps
  `revision`, so subscribers' event titles update in place.
- Wikipedia spells some teams differently from the Team Reference. The skill
  resolves names via `data/teams.json` first, then a small **alias overlay**
  bundled with the skill (`team-aliases.md`); unmatched names are reported, never
  guessed. `data/teams.json` stays the single source of truth for the 48 codes
  and is never edited by a sync.
- The skill never commits. A wrong resolution can only reach subscribers through
  a human who reviewed the diff and chose to push — the failure mode is a missed
  review, not an automated bad write.
- The Match Source's provenance is now mixed (hand-fixed structure, synced
  values). The boundary validation from ADR-0001 still rejects a malformed synced
  edit wholesale and serves the last good feed, so a bad sync degrades to stale,
  never to empty or partial.
