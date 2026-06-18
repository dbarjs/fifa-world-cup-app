import { type Team, Teams } from '#shared/schemas'
import teamsData from '../../data/teams.json'

// Unlike the Match Source (fetched from GitHub raw and validated at the request
// boundary), the Team Reference is static and bundled at build time. We still
// parse it through the schema once at load so a malformed hand-edit fails fast
// here rather than surfacing as a missing flag or name downstream.
/** The Team Reference, keyed by FIFA trigramme (`key === team.code`). */
export const teams: Teams = Teams.parse(teamsData)

/**
 * Resolve a Team by its FIFA trigramme. Returns `undefined` for a Placeholder
 * Pairing (`"1A"`, `"W73"`) or any unknown code — i.e. "this side is not a
 * resolved team yet", which callers fall back on rather than treat as an error.
 */
export function getTeamByCode(code: string): Team | undefined {
  return teams[code]
}
