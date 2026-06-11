export type Stage =
  | 'group'
  | 'round-of-32'
  | 'round-of-16'
  | 'quarter-final'
  | 'semi-final'
  | 'third-place-play-off'
  | 'final'

export interface Match {
  /** Official FIFA match number, 1–104. */
  matchNumber: number
  stage: Stage
  /** Group letter (A–L) for group-stage matches, null otherwise. */
  group?: string | null
  /** Team name, or a Placeholder Pairing side in FIFA bracket notation (e.g. "2A", "W73"). */
  home: string
  away: string
  /** Kickoff in UTC, ISO 8601 with Z suffix. */
  kickoff: string
  venue: string
  city: string
  /** Fixtures only for now — always null until results are populated. */
  score: { home: number, away: number } | null
  /** Bumped on edits; drives the ICS SEQUENCE so clients replace the event. */
  revision: number
}
