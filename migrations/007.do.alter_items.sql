ALTER TABLE items
ADD COLUMN acquisition_id INTEGER REFERENCES acquisitions(id);