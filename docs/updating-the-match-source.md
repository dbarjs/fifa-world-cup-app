# Updating the Match Source

The Match Source (`data/matches.json`) is the authoritative input to the
Calendar Feed. It is maintained by hand: edit the JSON, bump `revision` on the
matches you changed, commit, push to `main`. The `/calendar.ics` route fetches
the file from GitHub raw at request time, so changes go live without a
redeploy.

## The workflow

1. **Edit** the match entries that changed — typically resolving a Placeholder
   Pairing (`"home": "1A"` → `"home": "Mexico"`) once a bracket slot is
   decided, or correcting a kickoff, venue, or city.
2. **Bump `revision`** by 1 on every match you edited. Leave untouched matches
   alone.
3. **Run the tests** (`pnpm test`) — the Match Source schema tests catch
   malformed edits before they reach subscribers.
4. **Commit and push to `main`.** Subscribed calendars pick up the change the
   next time the client refreshes the feed.

## Why the revision bump matters

Each match's `revision` becomes the `SEQUENCE` property of its event in the
Calendar Feed. Calendar clients identify events by `UID` (derived from the
FIFA match number, e.g. `wc2026-m73@fifa-world-cup-app`) and only apply an
update when `SEQUENCE` increases. Bumping `revision` is what makes a client
replace the stale event in place — same calendar entry, new title — instead of
ignoring the change or showing a duplicate.

## Rules

- **Never change `matchNumber`** — it is the event's identity. Renumbering
  creates a new event and orphans the old one in every subscribed calendar.
- **Never lower `revision`** — clients ignore updates with a lower or equal
  `SEQUENCE` than what they have stored.
- **One bump per published change**, not per editing session: if you edit the
  same match twice before pushing, a single +1 is enough; if the first edit
  was already pushed, bump again.
- **Keep `score` as `null`** for now — the Calendar Feed carries fixtures
  only (see `CONTEXT.md`).
