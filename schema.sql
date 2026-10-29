CREATE TABLE IF NOT EXISTS interests (
  user_name TEXT NOT NULL CHECK (
    user_name IN ('Sam', 'Emina', 'Clementine', 'Landon', 'Melissa', 'Araella')
  ),
  event_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_name, event_id)
);
