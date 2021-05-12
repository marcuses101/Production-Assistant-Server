CREATE TYPE acquisition_enum AS ENUM ('purchase','rental','construction');

CREATE TABLE acquisitions (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  total_cost INTEGER DEFAULT 0 NOT NULL,
  date TIMESTAMPTZ,
  acquistition_type acquisition_enum
);