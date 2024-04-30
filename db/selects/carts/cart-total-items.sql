UPDATE productsCarts SET quantity = 3 WHERE cartId = "cart1" AND productId = "product1";

SELECT sum(quantity)
FROM productsCarts
JOIN products ON productsCarts.productId = products.productId
WHERE cartId = "cart1";