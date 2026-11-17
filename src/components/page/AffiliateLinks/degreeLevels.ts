/**
 * Degree levels for Career Center links. One value per link; the
 * Undergraduate / Graduate grouping is derived here, never stored.
 * Keep in sync with backend utils/affiliate_degree_levels.js.
 */
export type DegreeLevelGroup = 'UNDERGRADUATE' | 'GRADUATE'
export type DegreeLevelValue = 'DIPLOMA' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'

export const DEGREE_LEVEL_GROUPS: { value: DegreeLevelGroup; label: string }[] = [
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'GRADUATE', label: 'Graduate' },
]

export const DEGREE_LEVELS: { value: DegreeLevelValue; label: string; group: DegreeLevelGroup }[] = [
  { value: 'DIPLOMA', label: 'Diploma', group: 'UNDERGRADUATE' },
  { value: 'ASSOCIATE', label: "Associate's Degree", group: 'UNDERGRADUATE' },
  { value: 'BACHELOR', label: "Bachelor's Degree", group: 'UNDERGRADUATE' },
  { value: 'MASTER', label: "Master's Degree", group: 'GRADUATE' },
  { value: 'DOCTORATE', label: 'Doctoral Degree', group: 'GRADUATE' },
]

export function getDegreeLevel(value?: string | null) {
  if (!value) return undefined
  return DEGREE_LEVELS.find((d) => d.value === value)
}

export function getDegreeLevelLabel(value?: string | null): string | undefined {
  return getDegreeLevel(value)?.label
}

export function getDegreeLevelGroup(value?: string | null): DegreeLevelGroup | undefined {
  return getDegreeLevel(value)?.group
}
