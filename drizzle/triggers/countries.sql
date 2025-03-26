CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_countries
    BEFORE UPDATE ON countries
    FOR EACH ROW
BEGIN
    UPDATE countries SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE code = NEW.code;
END;