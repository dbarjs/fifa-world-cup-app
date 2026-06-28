---
status: accepted
---

# Represent a Match's kickoff as a Temporal.Instant via temporal-polyfill

A Match's kickoff was decoded at the Match Source boundary into a JavaScript
`Date` (see the `kickoff` codec in `shared/schemas`) and consumed as such:
duration math via `getTime()` and millisecond constants, chronological sort via
`getTime()` subtraction. We replace `Date` with `Temporal.Instant` throughout.
A kickoff is, and remains, a pure point in time (stored as a UTC `...Z` string);
no venue-local timezone is modelled, so this is a type modernization, not a
change in meaning — the glossary is untouched.

Temporal is a Stage-3 proposal not yet shipped natively in our Node 24 / V8
runtime, so a polyfill is required. All kickoff handling is server-side; the
Vue client imports `#shared/schemas` as `import type` only, so Temporal does not
reach the client bundle.

## Considered options

- **Temporal.Instant via `temporal-polyfill` (chosen).** Named import
  `{ Temporal }`, no global registration or Nuxt plugin. The codec decodes with
  `Temporal.Instant.from` and encodes with `.toString()`; consumers use
  `Temporal.Instant.compare`, `.add({ hours })`, and `Temporal.Duration`.
  `ical-generator` v11 accepts `Temporal.Instant` natively (its
  `ICalDateTimeValue` union includes the Temporal stubs), so no value is
  converted back to `Date`. Picked `temporal-polyfill` over the reference
  `@js-temporal/polyfill` for its ~5× smaller size and clean ESM named import —
  cheap insurance should Temporal ever tree-shake into the client.
- **Keep `Date`.** Rejected: the request was explicitly to standardize on
  Temporal; `Date`'s instant/duration ergonomics are what we're moving away from.
- **Luxon / dayjs.** Rejected: another date library, not the platform direction,
  and not the requested API.
- **`@js-temporal/polyfill` (official reference impl).** Rejected on size
  (~5× larger) with no fidelity benefit at our usage (`Instant`, `Duration`,
  `Now`).

## Consequences

- **Wire contract is unchanged.** `Temporal.Instant.toJSON()` emits the same
  ISO 8601 string as `Date.toJSON()`, so `GET /api/matches` output is identical
  and the route's e2e test is unaffected.
- A Stage-3 dependency is now load-bearing at the schema boundary; if the
  proposal changes shape before native landing, the codec and ~3 server consumers
  absorb it. Reversal is contained to those files plus the unit test.
- The client must keep importing `#shared/schemas` as `import type` only;
  a runtime import of the schema would pull `temporal-polyfill` into the browser
  bundle.
