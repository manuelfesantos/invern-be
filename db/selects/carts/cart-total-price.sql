SELECT sum(price * quantity) as totalPrice FROM productsCarts
JOIN products ON productsCarts.productId = products.productId
WHERE productsCarts.cartId = "cart1";