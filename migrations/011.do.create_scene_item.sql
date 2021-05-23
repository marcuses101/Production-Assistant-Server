CREATE TABLE scene_item (
  scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE NOT NULL,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (scene_id,item_id)
);