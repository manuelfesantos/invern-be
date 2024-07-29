import { db } from "@db";
import { eq } from "drizzle-orm";
import { ordersTable } from "@schema";
import { Order, orderSchema } from "@order-entity";

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  const ordersTemplate = await db().query.ordersTable.findMany({
    columns: {
      userId: false,
      addressId: false,
      paymentId: false,
    },
    where: eq(ordersTable.userId, userId),
    with: {
      address: true,
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

  return ordersTemplate.map((order) =>
    orderSchema.parse({
      ...order,
      products: order.productsToOrders.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
    }),
  );
};

export const getOrderById = async (
  orderId: string,
): Promise<Order | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.orderId, orderId),
    columns: {
      orderId: true,
      createdAt: true,
    },
    with: {
      address: {
        columns: {
          country: false,
        },
        with: {
          country: {
            with: {
              taxes: true,
            },
          },
        },
      },
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

  return orderTemplate
    ? orderSchema.parse({
        ...orderTemplate,
        products: orderTemplate.productsToOrders.map((product) => ({
          ...product.product,
          quantity: product.quantity,
        })),
      })
    : undefined;
};

export const getOrderByClientId = async (
  clientId: string,
): Promise<Order | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.clientOrderId, clientId),
    columns: {
      orderId: true,
      createdAt: true,
    },
    with: {
      address: {
        columns: {
          country: false,
        },
        with: {
          country: {
            with: {
              taxes: true,
            },
          },
        },
      },
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

  return orderTemplate
    ? orderSchema.parse({
        ...orderTemplate,
        products: orderTemplate.productsToOrders.map((product) => ({
          ...product.product,
          quantity: product.quantity,
        })),
      })
    : undefined;
};
