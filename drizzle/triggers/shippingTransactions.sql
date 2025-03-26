CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_shippingTransactions
    BEFORE UPDATE ON shippingTransactions
    FOR EACH ROW
BEGIN
    UPDATE shippingTransactions SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;