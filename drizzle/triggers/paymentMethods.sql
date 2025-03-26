CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_paymentMethods
    BEFORE UPDATE ON paymentMethods
    FOR EACH ROW
BEGIN
    UPDATE paymentMethods SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;