CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_products
    BEFORE UPDATE ON products
    FOR EACH ROW
BEGIN
    UPDATE products SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;