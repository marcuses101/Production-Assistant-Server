CREATE TABLE item_acquisition (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  acquisition_id INTEGER REFERENCES acquisitions(id) ON DELETE CASCADE NOT NULL
);