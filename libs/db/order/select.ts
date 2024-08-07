import { db } from "@db";
import { eq } from "drizzle-orm";
import { ordersTable } from "@schema";
import {
  ClientOrder,
  clientOrderSchema,
  Order,
  orderSchema,
} from "@order-entity";

export const getOrdersByUserId = async (
  userId: string,
): Promise<ClientOrder[]> => {
  const ordersTemplate = await db().query.ordersTable.findMany({
    columns: {
      userId: false,
      addressId: false,
      paymentId: false,
      orderId: false,
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
                  taxId: false,
                },
              },
              countriesToCurrencies: {
                columns: {
                  countryCode: false,
                  currencyCode: false,
                },
                with: {
                  currency: {
                    columns: {
                      rateToEuro: false,
                    },
                  },
                },
              },
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
                  currencies: order.address.country.countriesToCurrencies?.map(
                    (c) => c.currency,
                  ),
                }
              : undefined,
          }
        : undefined,
    }),
  );
};

export const getOrderById = async (
  orderId: string,
): Promise<Order | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.orderId, orderId),
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
                  taxId: false,
                },
              },
              countriesToCurrencies: {
                columns: {
                  countryCode: false,
                  currencyCode: false,
                },
                with: {
                  currency: {
                    columns: {
                      rateToEuro: false,
                    },
                  },
                },
              },
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
                    currencies:
                      orderTemplate.address.country.countriesToCurrencies?.map(
                        (c) => c.currency,
                      ),
                  }
                : undefined,
            }
          : undefined,
      })
    : undefined;
};

export const getOrderByClientId = async (
  clientId: string,
): Promise<ClientOrder | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.clientOrderId, clientId),
    columns: {
      userId: false,
      addressId: false,
      paymentId: false,
      orderId: false,
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
                  taxId: false,
                },
              },
              countriesToCurrencies: {
                columns: {
                  countryCode: false,
                  currencyCode: false,
                },
                with: {
                  currency: {
                    columns: {
                      rateToEuro: false,
                    },
                  },
                },
              },
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
                    currencies:
                      orderTemplate.address.country.countriesToCurrencies?.map(
                        (c) => c.currency,
                      ),
                  }
                : undefined,
            }
          : undefined,
      })
    : undefined;
};
