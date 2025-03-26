CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_taxes
    BEFORE UPDATE ON taxes
    FOR EACH ROW
BEGIN
    UPDATE taxes SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;