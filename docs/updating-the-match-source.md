# Updating the Match Source

The Match Source (`data/matches.json`) is the authoritative input to the
Calendar Feed. Its **structure** — the 104 Matches and their FIFA match numbers —
is fixed by hand; its **field values** (resolved participants, kickoff, venue,
city, and Results) are kept current by syncing from the Upstream Fixture Source
(Wikipedia), reviewed, then committed. The `/calendar.ics` route fetches the file
from GitHub raw at request time, so changes go live without a redeploy.

## The workflow

The normal path is the `sync-match-source` skill — ask Claude to "update the
matches" or "sync the match source". It fetches Wikipedia, applies the merge
policy below, runs the tests, and **presents a diff for you to review**. It does
not commit; publishing is a deliberate step you take after reading the diff.

1. **Sync.** The skill resolves Placeholder Pairings (`"home": "2A"` →
   `"home": "MEX"`), corrects `kickoff`/`venue`/`city`, and populates `score`
   once a Match is played. `home`/`away` hold a **FIFA team code** (the
   trigramme), not a name — the skill maps Wikipedia names to codes via
   `data/teams.json` (the Team Reference). The Calendar Feed resolves the code
   back to the team's display name.
2. **Review the diff.** Check the changed Matches and any rows the skill reported
   as *unmatched* (it never guesses an anchor or a team name). This is the safety
   gate before anything reaches subscribers.
3. **Tests have run** (`pnpm test`) — the schema, cardinality, and code-join
   tests catch a malformed edit before it can reach subscribers. Confirm green.
4. **Commit and push to `main`.** Subscribed calendars pick up the change the
   next time the client refreshes the feed. The route caches the Match Source
   server-side and at the edge for ~5 minutes (`matchSourceTtlSeconds`), so allow
   that long for a push to reach subscribers.

Hand-editing the JSON directly is still valid for the same field values — the
rules below apply either way — but the structure (match numbers, stage layout)
should not change.

## Why the revision bump matters

Each match's `revision` becomes the `SEQUENCE` property of its event in the
Calendar Feed. Calendar clients identify events by `UID` (derived from the FIFA
match number, e.g. `wc2026-m73@fifa-world-cup-app`) and only apply an update when
`SEQUENCE` increases. Bumping `revision` is what makes a client replace the stale
event in place — same calendar entry, new title (resolved teams, or a score) —
instead of ignoring the change or showing a duplicate.

## Rules

- **Never change `matchNumber`** — it is the event's identity. Renumbering
  creates a new event and orphans the old one in every subscribed calendar.
- **Never lower `revision`** — clients ignore updates with a lower or equal
  `SEQUENCE` than what they have stored.
- **One bump per published change**, not per editing session: if a Match changes
  twice before pushing, a single +1 is enough; if the first change was already
  pushed, bump again. (The sync diffs value-vs-value, so re-running before a push
  bumps nothing.)
- **Resolve one-directionally.** A side goes Placeholder Pairing → Team code,
  never back. A `score` goes `null` → a Result, never back to `null`; a genuine
  score correction is fine.
- **Use a FIFA code that exists in `data/teams.json`** when resolving a
  participant — the tests reject any `home`/`away` that is neither a known Team
  code nor a Placeholder Pairing. The 48 Teams are fixed once the groups are
  drawn; a sync never edits `data/teams.json`.
- **`score`** is `{ "home": <int≥0>, "away": <int≥0> }` for a played Match, or
  `null` while it is unplayed. The Calendar Feed renders the scoreline once a
  Result exists (see `CONTEXT.md` → Result).
