---
status: accepted
---

# Reference Teams by FIFA trigramme, joined from the Match Source by code

A Match's participants were stored as free-text display names (`"Mexico"`,
`"Türkiye"`). We introduce a **Team Reference** — a bundled `data/teams.json`
keyed by each Team's FIFA trigramme, carrying the display name and an optional
ISO 3166-1 alpha-2 country code — and migrate the Match Source so `home`/`away`
hold a **FIFA trigramme** (`"MEX"`) instead of a name. The Calendar Feed
resolves a code to the Team's name when building an event summary, falling back
to the raw string for a Placeholder Pairing.

## Considered options

- **FIFA trigramme as Team identity (chosen).** The only code system that covers
  every FIFA competitor, including England, Scotland, Wales and Northern Ireland
  — which are *not* ISO 3166-1 countries (they are subdivisions of `GB`). For
  sovereign nations the trigramme coincides with ISO alpha-3, so most codes read
  the same; the home nations are exactly where ISO breaks down.
- **ISO 3166-1 alpha-3 as identity.** Rejected: it cannot distinctly represent
  the four home nations, so it can't identify all FIFA Teams. The ISO country
  code is kept instead as an *optional attribute* of a Team (`countryCode`),
  present only when a sovereign-country mapping exists, used solely to derive a
  flag — never as identity.
- **Keep name-join (no migration).** Rejected: the display name was doing double
  duty as identity and presentation, making it brittle (diacritics, "United
  States" vs "USA") and giving nowhere to hang a country code or flag.

## Consequences

- The Match Source is no longer human-readable at a glance (`"MEX"` not
  `"Mexico"`); editing or resolving a Placeholder Pairing now means writing a
  FIFA code. `docs/updating-the-match-source.md` documents the codes.
- The Team Reference is **static and bundled**, not fetched like the Match
  Source — so adding or correcting a Team requires a redeploy. Acceptable: the
  competitor set is fixed for the tournament.
- No flag is stored. The `countryCode` lets each consumer derive whatever flag
  form it needs (SVG, emoji, custom); the ICS feed renders none today. The home
  nations carry no `countryCode` and therefore no flag until a consumer
  special-cases their `GB-*` subdivisions.
- A test validates every `countryCode` against `country-flag-icons` and asserts
  every named Match side resolves to a Team, so the code-join can't drift.
