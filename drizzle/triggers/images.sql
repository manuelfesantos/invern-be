CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_images
    BEFORE UPDATE ON images
    FOR EACH ROW
BEGIN
    UPDATE images SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE url = NEW.url;
END;