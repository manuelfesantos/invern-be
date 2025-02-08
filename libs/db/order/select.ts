import { db } from "@db";
import { eq } from "drizzle-orm";
import { ordersTable, productsToOrdersTable } from "@schema";
import { ClientOrder } from "@order-entity";
import { ProductIdAndQuantity } from "@product-entity";
import { decryptObjectString } from "@crypto-utils";

export const getOrdersByUserId = async (
  userId: string,
): Promise<ClientOrder[]> => {
  const ordersTemplate = await db().query.ordersTable.findMany({
    columns: {
      userId: false,
      paymentId: false,
    },
    where: eq(ordersTable.userId, userId),
    with: {
      payment: true,
      productsToOrders: {
        columns: {
          quantity: true,
        },
        with: {
          product: {
            columns: {
              collectionId: false,
            },
            with: {
              images: {
                columns: {
                  productId: false,
                  collectionId: false,
                },
                limit: 1,
              },
            },
          },
        },
      },
    },
  });

  return Promise.all(
    ordersTemplate.map(async (order) => ({
      ...order,
      products: order.productsToOrders.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
      address: await decryptObjectString(order.address),
    })),
  );
};

export const getOrderByStripeId = async (
  stripeId: string,
): Promise<ClientOrder | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.stripeId, stripeId),
    columns: {
      userId: false,
      paymentId: false,
    },
    with: {
      payment: true,
      productsToOrders: {
        columns: {
          quantity: true,
        },
        with: {
          product: {
            columns: {
              collectionId: false,
            },
            with: {
              images: {
                columns: {
                  productId: false,
                  collectionId: false,
                },
                limit: 1,
              },
            },
          },
        },
      },
    },
  });

  return (
    orderTemplate && {
      ...orderTemplate,
      products: orderTemplate.productsToOrders.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
      address: await decryptObjectString(orderTemplate.address),
    }
  );
};

export const getOrderById = async (
  id: string,
): Promise<ClientOrder | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.id, id),
    columns: {
      userId: false,
      stripeId: false,
    },
    with: {
      payment: true,
      productsToOrders: {
        columns: {
          quantity: true,
        },
        with: {
          product: {
            columns: {
              collectionId: false,
            },
            with: {
              images: {
                columns: {
                  productId: false,
                  collectionId: false,
                },
                limit: 1,
              },
            },
          },
        },
      },
    },
  });

  return (
    orderTemplate && {
      ...orderTemplate,
      products: orderTemplate.productsToOrders.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
      address: await decryptObjectString(orderTemplate.address),
    }
  );
};

export const getOrderProductsByPaymentId = async (
  paymentId: string,
): Promise<ProductIdAndQuantity[]> => {
  return db()
    .select({
      id: productsToOrdersTable.productId,
      quantity: productsToOrdersTable.quantity,
    })
    .from(ordersTable)
    .innerJoin(
      productsToOrdersTable,
      eq(productsToOrdersTable.orderId, ordersTable.id),
    )
    .where(eq(ordersTable.paymentId, paymentId));
};
