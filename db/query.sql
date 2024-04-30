SELECT sum(price * quantity) as TOTAL_PRICE FROM carts
JOIN productsCarts ON carts.cartId = productsCarts.cartId
JOIN products ON productsCarts.productId = products.productId
WHERE carts.cartId = "cart1";