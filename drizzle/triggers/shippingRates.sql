CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_shippingRates
    BEFORE UPDATE ON shippingRates
    FOR EACH ROW
BEGIN
    UPDATE shippingRates SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.id;
END;