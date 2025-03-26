CREATE TRIGGER IF NOT EXISTS update_lastModifiedAt_productsOnCarts_on_delete
    BEFORE DELETE ON productsOnCarts
    FOR EACH ROW
BEGIN
    UPDATE carts SET lastModifiedAt = strftime('%Y-%m-%dT%H:%M:%f', 'now') WHERE id = OLD.cartId;
END;--> statement-breakpoint