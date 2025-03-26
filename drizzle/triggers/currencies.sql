CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_currencies
    BEFORE UPDATE ON currencies
    FOR EACH ROW
BEGIN
    UPDATE currencies SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE code = NEW.code;
END;