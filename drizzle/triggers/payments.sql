CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_payments
    BEFORE UPDATE ON payments
    FOR EACH ROW
BEGIN
    UPDATE payments SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;