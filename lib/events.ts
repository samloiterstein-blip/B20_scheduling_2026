import agenda from "@/data/agenda.json";

export type EventTrack =
  | "plenary"
  | "sponsored"
  | "side session"
  | "networking"
  | "broadcast"
  | "lounge";

export const TRACKS: EventTrack[] = [
  "plenary",
  "sponsored",
  "side session",
  "networking",
  "broadcast",
  "lounge",
];

export type EventTopic =
  | "economic growth"
  | "innovation"
  | "trade"
  | "energy"
  | "networking"
  | "general";

export type Speaker = {
  name: string;
  role?: string;
};

export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  track: EventTrack;
  topic: EventTopic;
  speakers: Speaker[];
  description: string | null;
  allDay: boolean;
};

export const events = agenda as AgendaEvent[];

export const DAYS = [
  { key: "2026-11-09", label: "Monday", dateLabel: "November 9" },
  { key: "2026-11-10", label: "Tuesday", dateLabel: "November 10" },
  { key: "2026-11-11", label: "Wednesday", dateLabel: "November 11" },
] as const;

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 23;

export function eventDayKey(event: AgendaEvent) {
  return event.start.slice(0, 10);
}

export function parseTime(iso: string) {
  return new Date(iso);
}

export function formatClock(iso: string) {
  const hour = Number(iso.slice(11, 13));
  const minute = iso.slice(14, 16);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function formatRange(start: string, end: string) {
  return `${formatClock(start)} to ${formatClock(end)}`;
}

export function eventsForDay(dayKey: string, allDay: boolean) {
  return events.filter(
    (event) => eventDayKey(event) === dayKey && event.allDay === allDay,
  );
}
