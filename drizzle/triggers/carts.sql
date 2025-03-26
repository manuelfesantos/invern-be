CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_carts
    BEFORE UPDATE ON carts
    FOR EACH ROW
BEGIN
    UPDATE carts SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;