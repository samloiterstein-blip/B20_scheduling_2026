export const TEAM = [
  "Sam",
  "Emina",
  "Clementine",
  "Landon",
  "Melissa",
  "Araella",
] as const;

export type TeamMember = (typeof TEAM)[number];

export function isTeamMember(value: string): value is TeamMember {
  return (TEAM as readonly string[]).includes(value);
}

export function initials(name: string) {
  return name.slice(0, 1);
}
