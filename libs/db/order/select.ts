import { db } from "@db";
import { contextStore } from "@context-utils";
import { eq } from "drizzle-orm";
import { ordersTable, productsToOrdersTable } from "@schema";
import {
  ClientOrder,
  clientOrderSchema,
  Order,
  orderSchema,
} from "@order-entity";
import { ProductIdAndQuantity } from "@product-entity";

export const getOrdersByUserId = async (
  userId: string,
): Promise<ClientOrder[]> => {
  const ordersTemplate = await (
    contextStore.context.transaction ?? db()
  ).query.ordersTable.findMany({
    columns: {
      userId: false,
      addressId: false,
      paymentId: false,
      id: false,
    },
    where: eq(ordersTable.userId, userId),
    with: {
      address: {
        columns: {
          country: false,
        },
        with: {
          country: {
            with: {
              taxes: {
                columns: {
                  countryCode: false,
                  id: false,
                },
              },
              currency: {},
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

  return ordersTemplate.map((order) =>
    clientOrderSchema.parse({
      ...order,
      products: order.productsToOrders.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
      address: order.address
        ? {
            ...order.address,
            country: order.address.country
              ? {
                  ...order.address.country,
                  taxes: order.address.country.taxes
                    ? order.address.country.taxes
                    : [],
                }
              : undefined,
          }
        : undefined,
    }),
  );
};

export const getOrderByStripeId = async (
  stripeId: string,
): Promise<Order | undefined> => {
  const orderTemplate = await (
    contextStore.context.transaction ?? db()
  ).query.ordersTable.findFirst({
    where: eq(ordersTable.stripeId, stripeId),
    columns: {
      userId: false,
      addressId: false,
      paymentId: false,
    },
    with: {
      address: {
        columns: {
          country: false,
        },
        with: {
          country: {
            with: {
              taxes: {
                columns: {
                  countryCode: false,
                },
              },
              currency: {},
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
        address: orderTemplate.address
          ? {
              ...orderTemplate.address,
              country: orderTemplate.address.country
                ? {
                    ...orderTemplate.address.country,
                    taxes: orderTemplate.address.country.taxes
                      ? orderTemplate.address.country.taxes
                      : [],
                  }
                : undefined,
            }
          : undefined,
      })
    : undefined;
};

export const getOrderById = async (
  id: string,
): Promise<ClientOrder | undefined> => {
  const orderTemplate = await (
    contextStore.context.transaction ?? db()
  ).query.ordersTable.findFirst({
    where: eq(ordersTable.id, id),
    columns: {
      userId: false,
      addressId: false,
      paymentId: false,
      stripeId: false,
    },
    with: {
      address: {
        columns: {
          country: false,
        },
        with: {
          country: {
            with: {
              taxes: {
                columns: {
                  countryCode: false,
                  id: false,
                },
              },
              currency: {},
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
    ? clientOrderSchema.parse({
        ...orderTemplate,
        products: orderTemplate.productsToOrders.map((product) => ({
          ...product.product,
          quantity: product.quantity,
        })),
        address: orderTemplate.address
          ? {
              ...orderTemplate.address,
              country: orderTemplate.address.country
                ? {
                    ...orderTemplate.address.country,
                    taxes: orderTemplate.address.country.taxes
                      ? orderTemplate.address.country.taxes
                      : [],
                  }
                : undefined,
            }
          : undefined,
      })
    : undefined;
};

export const getOrderProductsByPaymentId = async (
  paymentId: string,
): Promise<ProductIdAndQuantity[]> => {
  return (contextStore.context.transaction ?? db())
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
