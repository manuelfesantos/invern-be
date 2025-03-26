CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_shippingMethods
    BEFORE UPDATE ON shippingMethods
    FOR EACH ROW
BEGIN
    UPDATE shippingMethods SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;