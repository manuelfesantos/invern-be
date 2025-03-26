CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_checkoutSessions
    BEFORE UPDATE ON checkoutSessions
    FOR EACH ROW
BEGIN
    UPDATE checkoutSessions SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;