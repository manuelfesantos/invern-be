CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_users
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;