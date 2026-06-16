# Team name aliases (Wikipedia → FIFA trigramme)

Use this overlay **only** when an upstream (Wikipedia) team name does not match a
`name` in `data/teams.json` exactly. The Team Reference (`data/teams.json`) is
the source of truth for the 48 codes; this file carries only the *exceptions*
where Wikipedia spells a team differently. If a name matches neither
`teams.json` nor this table, report it unmatched — do not guess.

Match case-insensitively and ignore surrounding whitespace. Keep this list short;
add a row when a new real divergence appears.

| Upstream spelling (Wikipedia / FIFA) | Code | `teams.json` name |
| --- | --- | --- |
| Korea Republic | KOR | South Korea |
| Republic of Korea | KOR | South Korea |
| Turkey | TUR | Türkiye |
| Turkiye | TUR | Türkiye |
| IR Iran | IRN | Iran |
| Ivory Coast | CIV | Côte d'Ivoire |
| Cote d'Ivoire | CIV | Côte d'Ivoire |
| Cape Verde | CPV | Cabo Verde |
| Czech Republic | CZE | Czechia |
| Democratic Republic of the Congo | COD | DR Congo |
| DR Congo | COD | DR Congo |
| Congo DR | COD | DR Congo |
| United States of America | USA | United States |
| USA | USA | United States |
| Curacao | CUW | Curaçao |
| Bosnia & Herzegovina | BIH | Bosnia and Herzegovina |

Notes:
- England (ENG) and Scotland (SCO) have no ISO country code in `teams.json`;
  their names already match Wikipedia, so they need no alias.
- Accented names (`Türkiye`, `Côte d'Ivoire`, `Curaçao`) are stored with their
  diacritics in `teams.json` — the ASCII rows above cover sources that drop them.
