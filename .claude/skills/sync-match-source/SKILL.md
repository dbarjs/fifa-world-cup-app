---
name: sync-match-source
description: Sync the Match Source (data/matches.json) field values from Wikipedia — resolve Placeholder Pairings, correct kickoff/venue/city, and populate Results — then present a reviewable diff. Use when asked to "update the matches", "sync the match source", "refresh fixtures", or "pull in scores/results".
---

# Sync Match Source

Keep `data/matches.json` (the **Match Source**) current by syncing its *field
values* from Wikipedia (the **Upstream Fixture Source**), then stopping at a
reviewable diff. You fill and correct values on the 104 Matches that already
exist — you never restructure the file.

Read `CONTEXT.md` (glossary) and `docs/updating-the-match-source.md` (identity
and `revision`/SEQUENCE rules) before editing. This skill is the operational
procedure; those documents are the rules of record.

## Non-negotiables

- **The file is the spine.** Match by FIFA `matchNumber` only. Never add,
  remove, reorder, or renumber Matches. The file always stays 104 Matches in
  order — the schema test enforces it.
- **Never touch `matchNumber`.** It is the calendar event's identity.
- **Never lower `revision`.** Clients ignore an update whose SEQUENCE is not
  higher than what they hold.
- **Stop at the diff.** Do not commit or push as part of syncing. Committing &
  pushing to `main` is a *separate* step the human explicitly asks for.

## Procedure

### 1. Fetch the upstream data

Use the **MediaWiki API** (`action=parse`), not the rendered HTML page:

- Knockout bracket / pairings: the *2026 FIFA World Cup* article.
- Group-stage fixtures and results: the same article's group sections (and
  per-group sub-articles if needed).

Example: `https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup&prop=wikitext&format=json`
(fetch a specific `&section=N` once you know the section index). Prefer wikitext;
fall back to `prop=text` (section HTML) when a table is easier to read rendered.

### 2. Anchor each upstream row to a `matchNumber`

In priority order, never on a mutable field:

1. The official **FIFA match number** if the row exposes it.
2. Otherwise the **stable slot**: group + matchday position for group games;
   bracket slot (`W73`, `1A vs 2B`) for knockouts.

If you cannot confidently anchor a row, **do not guess** — list it under
"unmatched rows" in your report and move on.

### 3. Resolve participant names to FIFA trigrammes

`home`/`away` are stored as **FIFA trigrammes** (`"MEX"`), or bracket notation
(`"2A"`, `"W73"`) while unresolved. Wikipedia gives display names, so resolve
each name to a code by:

1. **Exact match** against the `name` field in `data/teams.json` (the **Team
   Reference**, the single source of truth for the 48 codes).
2. Else the **alias overlay** in [team-aliases.md](./team-aliases.md) for known
   Wikipedia spelling variants.
3. Else **report it unmatched** — never guess, never invent a Team.

Only ever write one of the 48 existing codes. **Never edit `data/teams.json`** —
the 48 teams are fixed once the groups are drawn.

### 4. Apply the merge policy

Compare each upstream value to the current value in `data/matches.json` (a
value-vs-value diff, so re-running is idempotent):

- **Wikipedia wins** on `kickoff`, `venue`, `city`, and `score` when they differ.
- **Resolution is one-directional.** A side may go Placeholder Pairing → trigramme,
  **never** trigramme → placeholder. A `score` may go `null` → a Result, **never**
  a Result → `null`. A genuine score correction (e.g. `2–1` → `2–2`) is allowed.
- **`kickoff`** stays an ISO-8601 string with a `Z` suffix (e.g.
  `"2026-06-28T19:00:00Z"`).
- **`score`** is `{ "home": <int≥0>, "away": <int≥0> }` or `null`.
- **`venue`/`city`** keep the spelling already used in the file when they refer
  to the same place.

### 5. Bump `revision`

For **each Match whose value actually changed**, increase `revision` by exactly
1 — once per Match per run, regardless of how many of its fields changed. Leave
untouched Matches alone. (A re-run before committing finds the values already
equal and bumps nothing.)

### 6. Validate

Run `pnpm test`. The schema / cardinality / code-join guards catch a malformed
edit (bad trigramme, broken kickoff format, lost Match) before it can reach
subscribers. Fix and re-run until green.

### 7. Report — and stop

Present, then stop:

- **Changed Matches**: per Match, the fields that changed (old → new) and the new
  `revision`.
- **Unmatched rows**: upstream rows you could not anchor or names you could not
  resolve — these need a human.
- **Test result**: green / red.

Do **not** commit or push. If the human then asks to publish, commit the change
and push to `main` (see `docs/updating-the-match-source.md` for why the push is
what reaches subscribers, and the cache delay before it does).
