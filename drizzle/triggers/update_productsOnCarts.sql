CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_productsOnCarts
    BEFORE UPDATE ON productsOnCarts
    FOR EACH ROW
BEGIN
    UPDATE carts SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.cartId;
END;