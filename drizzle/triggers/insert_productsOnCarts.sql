CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_productsOnCarts_on_insert
    BEFORE INSERT ON productsOnCarts
    FOR EACH ROW
BEGIN
    UPDATE carts SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = NEW.cartId;
END;--> statement-breakpoint