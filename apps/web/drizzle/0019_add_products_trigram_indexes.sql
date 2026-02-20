CREATE INDEX IF NOT EXISTS products_id_trgm_idx
ON products USING gin (id gin_trgm_ops)
WHERE hidden = false;

CREATE INDEX IF NOT EXISTS products_name_trgm_idx
ON products USING gin (name gin_trgm_ops)
WHERE hidden = false;

CREATE INDEX IF NOT EXISTS products_description_trgm_idx
ON products USING gin (description gin_trgm_ops)
WHERE hidden = false;

CREATE INDEX IF NOT EXISTS products_category_trgm_idx
ON products USING gin (category gin_trgm_ops)
WHERE hidden = false;
