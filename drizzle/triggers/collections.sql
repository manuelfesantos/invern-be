CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_collections
    BEFORE UPDATE ON collections
    FOR EACH ROW
BEGIN
    UPDATE collections SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;