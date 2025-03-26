CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW
BEGIN
    UPDATE orders SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;