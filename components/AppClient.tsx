"use client";

import type { SealedLiveQuery } from "@neon/realtime/client";
import { useLiveQuery } from "@neon/realtime-react";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react";

import { EventDrawer } from "@/components/EventDrawer";
import { WeekCalendar } from "@/components/WeekCalendar";
import {
  TRACKS,
  events,
  formatRange,
  type AgendaEvent,
  type EventTrack,
} from "@/lib/events";
import type { Interest, WriteResult } from "@/lib/interests";
import { TEAM, initials, type TeamMember } from "@/lib/users";

const USER_KEY = "b20-current-user";

function groupNames(rows: Interest[]) {
  const map = new Map<string, TeamMember[]>();
  for (const row of rows) {
    const list = map.get(row.event_id) ?? [];
    list.push(row.user_name as TeamMember);
    map.set(row.event_id, list);
  }
  return map;
}

export function AppClient({
  initialInterests,
  sealedQuery,
}: {
  initialInterests: Interest[];
  sealedQuery: SealedLiveQuery<Interest>;
}) {
  const [query] = useState(sealedQuery);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(USER_KEY);
    if (TEAM.includes(stored as TeamMember)) {
      setCurrentUser(stored as TeamMember);
    }
  }, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "mine" | "overlap">("all");
  const [trackFilter, setTrackFilter] = useState<"all" | EventTrack>("all");
  const [busy, setBusy] = useState(false);

  const refreshQuery = useCallback(
    () =>
      fetch("/api/interests/live", { method: "POST", cache: "no-store" }).then(
        (res) => {
          if (!res.ok) throw new Error("Could not renew live query");
          return res.json() as Promise<SealedLiveQuery<Interest>>;
        },
      ),
    [],
  );

  const { data, status, error, utils } = useLiveQuery(query, {
    initialData: initialInterests,
    refreshQuery,
  });

  const [rows, applyOptimistic] = useOptimistic(
    (data ?? initialInterests) as Interest[],
    (_current: Interest[], next: Interest[]) => next,
  );

  const namesByEvent = useMemo(() => groupNames(rows), [rows]);
  const selected = events.find((event) => event.id === selectedId) ?? null;
  const selectedNames = selected
    ? (namesByEvent.get(selected.id) ?? [])
    : [];

  const overlapList = useMemo(() => {
    return [...events]
      .map((event) => ({
        event,
        names: namesByEvent.get(event.id) ?? [],
      }))
      .filter((item) => item.names.length > 0)
      .filter((item) => trackFilter === "all" || item.event.track === trackFilter)
      .sort(
        (a, b) =>
          b.names.length - a.names.length ||
          a.event.start.localeCompare(b.event.start),
      );
  }, [namesByEvent, trackFilter]);

  function chooseUser(name: TeamMember) {
    setCurrentUser(name);
    window.localStorage.setItem(USER_KEY, name);
  }

  async function toggle(event: AgendaEvent) {
    if (!currentUser) return;
    const existing = namesByEvent.get(event.id) ?? [];
    const already = existing.includes(currentUser);
    const next = already
      ? rows.filter(
          (row) =>
            !(row.user_name === currentUser && row.event_id === event.id),
        )
      : [
          ...rows,
          {
            user_name: currentUser,
            event_id: event.id,
            created_at: new Date().toISOString(),
          },
        ];
    setBusy(true);
    startTransition(async () => {
      applyOptimistic(next);
      try {
        const res = await fetch("/api/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: currentUser,
            eventId: event.id,
          }),
        });
        const result = (await res.json()) as WriteResult;
        if (result.kind === "committed") {
          await utils.awaitTxId(result.txid, 10_000);
        }
      } finally {
        setBusy(false);
      }
    });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">U.S. Chamber of Commerce</p>
          <h1>B20 team sign-ups</h1>
          <p className="lede">
            November 9 to 11, 2026. The Anthem, Washington, DC. Pick your name,
            mark the sessions you want, and see where the team overlaps.
          </p>
        </div>
        <div className="name-picker" role="group" aria-label="Team member">
          {TEAM.map((name) => (
            <button
              key={name}
              type="button"
              className={currentUser === name ? "name-btn active" : "name-btn"}
              onClick={() => chooseUser(name)}
            >
              <span className="chip">{initials(name)}</span>
              {name}
            </button>
          ))}
        </div>
      </header>

      <div className="toolbar">
        <div className="filters" role="group" aria-label="Filter sessions">
          {(
            [
              ["all", "All sessions"],
              ["mine", "My picks"],
              ["overlap", "Team overlap"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? "filter active" : "filter"}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
          <label className="track-filter">
            Track
            <select
              value={trackFilter}
              onChange={(event) =>
                setTrackFilter(event.target.value as "all" | EventTrack)
              }
            >
              <option value="all">All tracks</option>
              {TRACKS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className={`live-status ${status}`}>
          {status === "live"
            ? "Live updates on"
            : status === "error"
              ? `Live updates stopped: ${error?.message ?? "unknown error"}`
              : "Connecting live updates"}
        </p>
      </div>

      <div className="workspace">
        <WeekCalendar
          currentUser={currentUser}
          namesByEvent={namesByEvent}
          filter={filter}
          trackFilter={trackFilter}
          onSelect={(event) => setSelectedId(event.id)}
        />
        <aside className="overlap-panel">
          <h2>Where the team should be</h2>
          {overlapList.length === 0 ? (
            <p className="muted">
              Mark sessions to see overlap. The more people who click I am in,
              the higher a session rises here.
            </p>
          ) : (
            <ol>
              {overlapList.map(({ event, names }) => (
                <li key={event.id}>
                  <button type="button" onClick={() => setSelectedId(event.id)}>
                    <span className="count">{names.length}</span>
                    <span>
                      <strong>{event.title}</strong>
                      <em>
                        {formatRange(event.start, event.end)} · {event.location}
                      </em>
                      <span className="chip-row">
                        {names.map((name) => (
                          <span key={name} className="chip tiny">
                            {initials(name)}
                          </span>
                        ))}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>

      {selected ? (
        <EventDrawer
          event={selected}
          interested={selectedNames}
          currentUser={currentUser}
          busy={busy}
          onClose={() => setSelectedId(null)}
          onToggle={() => toggle(selected)}
        />
      ) : null}
    </div>
  );
}
