"use client";

import {
  formatRange,
  type AgendaEvent,
} from "@/lib/events";
import { initials, type TeamMember } from "@/lib/users";

export function EventDrawer({
  event,
  interested,
  currentUser,
  busy,
  onClose,
  onToggle,
}: {
  event: AgendaEvent;
  interested: TeamMember[];
  currentUser: TeamMember | null;
  busy: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const isIn = currentUser ? interested.includes(currentUser) : false;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-labelledby="event-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="drawer-close" type="button" onClick={onClose}>
          Close
        </button>
        <p className="eyebrow">{event.track}</p>
        <h2 id="event-title">{event.title}</h2>
        <p className="meta">{formatRange(event.start, event.end)}</p>
        <p className="meta">{event.location}</p>
        <p className="meta">Topic: {event.topic}</p>

        {event.description ? (
          <p className="body">{event.description}</p>
        ) : (
          <p className="body muted">
            Programming details have not been published.
          </p>
        )}

        {event.speakers.length > 0 ? (
          <section>
            <h3>Speakers and attendees</h3>
            <ul className="speaker-list">
              {event.speakers.map((speaker) => (
                <li key={`${speaker.name}-${speaker.role ?? ""}`}>
                  <strong>{speaker.name}</strong>
                  {speaker.role ? <span>{speaker.role}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h3>Who wants to go</h3>
          {interested.length === 0 ? (
            <p className="muted">No one has marked this session yet.</p>
          ) : (
            <ul className="who-list">
              {interested.map((name) => (
                <li key={name}>
                  <span className="chip">{initials(name)}</span>
                  {name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          className={isIn ? "primary-btn in" : "primary-btn"}
          type="button"
          disabled={!currentUser || busy}
          onClick={onToggle}
        >
          {!currentUser
            ? "Pick your name first"
            : isIn
              ? "I am in. Remove me"
              : "I am in"}
        </button>
      </aside>
    </div>
  );
}
