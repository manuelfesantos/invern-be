INSERT INTO products
VALUES ("product1", "ceramics bowl", "A beautiful ceramics bowl made of the finest ceramics in the world", 1000),
("product2", "happy mug", "A happy mug for a happy friend!", 500),
("product3", "luxury cup", "The finest luxury cup of all", 2000),
("product4", "sad mug", "A sad mug for sad people", 250),
("product5", "wooden spoon", "Wooden spoon for wooden people", 300);

INSERT INTO images VALUES
("https://images.invernspirit.com/products/ceramics-bowl-1.jpeg", "A ceramics bowl image", 1, "product1"),
("https://images.invernspirit.com/products/ceramics-bowl-2.jpeg", "A ceramics bowl image closeup", 2, "product1"),
("https://images.invernspirit.com/products/ceramics-bowl-3.jpeg", "A ceramics bowl image far away", 3, "product1"),
("https://images.invernspirit.com/products/happy-mug-1.jpeg", "A happy mug image", 1, "product2"),
("https://images.invernspirit.com/products/happy-mug-2.jpeg", "A happy mug image closeup", 2, "product2"),
("https://images.invernspirit.com/products/happy-mug-3.jpeg", "A happy mug image far away", 3, "product2"),
("https://images.invernspirit.com/products/luxury-cup-1.jpeg", "A luxury cup image", 1, "product3"),
("https://images.invernspirit.com/products/luxury-cup-2.jpeg", "A luxury cup image closeup", 2, "product3"),
("https://images.invernspirit.com/products/luxury-cup-3.jpeg", "A luxury cup image far away", 3, "product3"),
("https://images.invernspirit.com/products/sad-mug-1.jpeg", "A sad mug image", 1, "product4"),
("https://images.invernspirit.com/products/sad-mug-2.jpeg", "A sad mug image closeup", 2, "product4"),
("https://images.invernspirit.com/products/sad-mug-3.jpeg", "A sad mug image far away", 3, "product4"),
("https://images.invernspirit.com/products/wooden-spoon-1.jpeg", "A wooden spoon image", 1, "product5"),
("https://images.invernspirit.com/products/wooden-spoon-2.jpeg", "A wooden spoon image closeup", 2, "product5"),
("https://images.invernspirit.com/products/wooden-spoon-3.jpeg", "A wooden spoon image far away", 3, "product5");

INSERT INTO users
VALUES ("user1", "manuelfesantos@gmail.com", "Manuel", "Santos", "password1", "cart1"),
("user2", "mafperodrigues12@gmail.com", "Mafalda", "Rodrigues", "password2", "cart2"),
("user3", "malolas@gmail.com", "Jonas", "Pereira", "password3", "cart3");

INSERT INTO productsCarts (productId, cartId)
VALUES ("product1", "cart1"),
("product2", "cart1"),
("product3", "cart1"),
("product4", "cart1"),
("product5", "cart1"),
("product2", "cart3"),
("product4", "cart3"),
("product5", "cart3"),
("product5", "cart2"),
("product2", "cart4");
