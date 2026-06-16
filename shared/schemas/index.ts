import { z } from 'zod'

// Single source of truth for the app's domain types. Every exported type is
// inferred from its zod schema; the schema (a runtime value) and the type
// share one name via TypeScript's separate value/type namespaces. Lives in
// shared/ so both the Nitro server and the Vue app can use it — so it must
// not import any Vue or Nitro code (see Nuxt's shared/ directory docs).

/** The phase of the tournament a Match belongs to (see CONTEXT.md → Stage). */
export const Stage = z.enum([
  'group',
  'round-of-32',
  'round-of-16',
  'quarter-final',
  'semi-final',
  'third-place-play-off',
  'final',
])
export type Stage = z.infer<typeof Stage>

// Kickoff is stored as an ISO 8601 string in the Match Source and decoded to a
// Date when the source is parsed at the boundary; code consumes the Date. The
// encode direction (Date → ISO) is unused today — nothing serializes a Match
// back — but comes for free with the codec.
const kickoff = z.codec(z.iso.datetime(), z.date(), {
  decode: isoString => new Date(isoString),
  encode: date => date.toISOString(),
})

/** Final score of a played Match; absent (null) until a Result exists. */
const Score = z.object({
  home: z.number().int().nonnegative(),
  away: z.number().int().nonnegative(),
})

export const Match = z
  .object({
    /** Official FIFA match number, 1–104. */
    matchNumber: z.number().int().min(1).max(104),
    stage: Stage,
    /** Group letter (A–L) for group-stage matches, null otherwise. */
    group: z.string().regex(/^[A-L]$/).nullable(),
    /** FIFA team code (see Team), or a Placeholder Pairing side in bracket notation (e.g. "2A", "W73"). */
    home: z.string().min(1),
    away: z.string().min(1),
    kickoff,
    venue: z.string().min(1),
    city: z.string().min(1),
    /** Absent score means an unplayed Match. */
    score: Score.nullable().default(null),
    /** Bumped on edits; drives the ICS SEQUENCE so clients replace the event. */
    revision: z.number().int().nonnegative(),
  })
  // A group-stage Match carries its group letter; a knockout Match has none.
  .refine(
    match => (match.stage === 'group' ? match.group !== null : match.group === null),
    {
      error: 'group must be a letter A–L for group-stage matches and null otherwise',
      path: ['group'],
    },
  )
export type Match = z.infer<typeof Match>

/** The Match Source: every Match, never empty (see CONTEXT.md → Match Source). */
export const MatchSource = z.array(Match).min(1)
export type MatchSource = z.infer<typeof MatchSource>

/** A FIFA competitor (see CONTEXT.md → Team). Identity is the FIFA trigramme. */
export const Team = z.object({
  /** FIFA trigramme — the Team's identity and the Match Source join key. */
  code: z.string().regex(/^[A-Z]{3}$/),
  /** Display name as it appears in match summaries. */
  name: z.string().min(1),
  /**
   * ISO 3166-1 alpha-2, present only when the Team maps to a sovereign country.
   * Omitted for FIFA home nations (e.g. England, Scotland) that ISO 3166-1
   * cannot express; consumers derive a flag from this code.
   */
  countryCode: z.string().regex(/^[A-Z]{2}$/).optional(),
})
export type Team = z.infer<typeof Team>

/** The Team Reference: all Teams, keyed by FIFA trigramme (`key === team.code`). */
export const Teams = z.record(z.string(), Team)
export type Teams = z.infer<typeof Teams>

export const SubscribeLinks = z.object({
  /** The Calendar Feed URL in webcal:// form — what other clients paste. */
  feedUrl: z.string(),
  /** Subscribe Link for Apple Calendar (webcal:// opens its subscribe flow). */
  apple: z.string(),
  /** Subscribe Link for Google Calendar's add-by-URL flow. */
  google: z.string(),
})
export type SubscribeLinks = z.infer<typeof SubscribeLinks>
