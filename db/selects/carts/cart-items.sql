SELECT products.productId, name, price, quantity, url
FROM productsCarts
JOIN products ON productsCarts.productId = products.productId
JOIN images ON products.productId = images.productId
WHERE productsCarts.cartId = "cart1"
GROUP BY products.productId;