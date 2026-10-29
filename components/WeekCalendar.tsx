"use client";

import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  DAYS,
  eventsForDay,
  formatClock,
  type AgendaEvent,
} from "@/lib/events";
import { initials, type TeamMember } from "@/lib/users";

const HOUR_PX = 68;
const HOURS = DAY_END_HOUR - DAY_START_HOUR;

function minutes(iso: string) {
  const [h, m] = iso.slice(11, 16).split(":").map(Number);
  return h * 60 + m;
}

function layoutDay(dayEvents: AgendaEvent[]) {
  const sorted = [...dayEvents].sort(
    (a, b) => minutes(a.start) - minutes(b.start) || minutes(b.end) - minutes(a.end),
  );
  const clusters: AgendaEvent[][] = [];
  let cluster: AgendaEvent[] = [];
  let clusterEnd = -1;
  for (const event of sorted) {
    const start = minutes(event.start);
    const end = minutes(event.end);
    if (cluster.length === 0 || start < clusterEnd) {
      cluster.push(event);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      clusters.push(cluster);
      cluster = [event];
      clusterEnd = end;
    }
  }
  if (cluster.length) clusters.push(cluster);

  return clusters.flatMap((group) => {
    const colEnd: number[] = [];
    const cols = new Map<string, number>();
    for (const event of group) {
      let col = colEnd.findIndex((t) => t <= minutes(event.start));
      if (col < 0) {
        col = colEnd.length;
        colEnd.push(minutes(event.end));
      } else {
        colEnd[col] = minutes(event.end);
      }
      cols.set(event.id, col);
    }
    const colCount = Math.max(colEnd.length, 1);
    return group.map((event) => ({
      event,
      col: cols.get(event.id) ?? 0,
      colCount,
      top: ((minutes(event.start) - DAY_START_HOUR * 60) / 60) * HOUR_PX,
      height: Math.max(
        ((minutes(event.end) - minutes(event.start)) / 60) * HOUR_PX - 2,
        22,
      ),
    }));
  });
}

export function WeekCalendar({
  currentUser,
  namesByEvent,
  filter,
  trackFilter,
  onSelect,
}: {
  currentUser: TeamMember | null;
  namesByEvent: Map<string, TeamMember[]>;
  filter: "all" | "mine" | "overlap";
  trackFilter: "all" | AgendaEvent["track"];
  onSelect: (event: AgendaEvent) => void;
}) {
  const hours = Array.from({ length: HOURS }, (_, i) => DAY_START_HOUR + i);

  function visible(event: AgendaEvent) {
    if (trackFilter !== "all" && event.track !== trackFilter) return false;
    const names = namesByEvent.get(event.id) ?? [];
    if (filter === "mine") return currentUser ? names.includes(currentUser) : false;
    if (filter === "overlap") return names.length >= 2;
    return true;
  }

  return (
    <div className="calendar">
      <div className="all-day-row">
        <div className="gutter-label">All day</div>
        {DAYS.map((day) => (
          <div key={day.key} className="all-day-col">
            {eventsForDay(day.key, true)
              .filter(visible)
              .map((event) => {
                const names = namesByEvent.get(event.id) ?? [];
                return (
                  <button
                    key={event.id}
                    type="button"
                    className="all-day-chip"
                    style={{
                      background: `rgba(0, 36, 82, ${0.08 + names.length * 0.12})`,
                    }}
                    onClick={() => onSelect(event)}
                  >
                    <span>{event.title}</span>
                    {names.length > 0 ? (
                      <span className="chip-row">
                        {names.map((name) => (
                          <span key={name} className="chip tiny">
                            {initials(name)}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      <div className="day-head">
        <div className="gutter" />
        {DAYS.map((day) => (
          <div key={day.key} className="day-title">
            <span>{day.label}</span>
            <strong>{day.dateLabel}</strong>
          </div>
        ))}
      </div>

      <div className="grid-wrap">
        <div className="time-gutter">
          {hours.map((hour) => (
            <div key={hour} className="hour-label" style={{ height: HOUR_PX }}>
              {formatClock(`2026-11-09T${String(hour).padStart(2, "0")}:00:00-05:00`)}
            </div>
          ))}
        </div>
        {DAYS.map((day) => {
          const laidOut = layoutDay(eventsForDay(day.key, false).filter(visible));
          return (
            <div
              key={day.key}
              className="day-col"
              style={{ height: HOURS * HOUR_PX }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="hour-line"
                  style={{ top: (hour - DAY_START_HOUR) * HOUR_PX }}
                />
              ))}
              {laidOut.map(({ event, col, colCount, top, height }) => {
                const names = namesByEvent.get(event.id) ?? [];
                const mine = currentUser ? names.includes(currentUser) : false;
                return (
                  <button
                    key={event.id}
                    type="button"
                    className={mine ? "block mine" : "block"}
                    style={{
                      top,
                      height,
                      left: `calc(${(col / colCount) * 100}% + 2px)`,
                      width: `calc(${100 / colCount}% - 4px)`,
                      background: `rgba(0, 36, 82, ${0.1 + names.length * 0.12})`,
                    }}
                    onClick={() => onSelect(event)}
                  >
                    <span className="block-time">{formatClock(event.start)}</span>
                    <span className="block-title">{event.title}</span>
                    {names.length > 0 ? (
                      <span className="chip-row">
                        {names.map((name) => (
                          <span key={name} className="chip tiny">
                            {initials(name)}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
