import { db } from "@db";
import { eq } from "drizzle-orm";
import { ordersTable } from "@schema";
import { baseOrderSchema, ClientOrder } from "@order-entity";
import { LineItem } from "@product-entity";

export const selectOrdersByUserId = async (
  userId: string,
): Promise<ClientOrder[]> => {
  const ordersTemplate = await db().query.ordersTable.findMany({
    columns: {
      paymentId: false,
    },
    where: eq(ordersTable.userId, userId),
    with: {
      payment: {
        columns: {
          paymentMethodId: false,
        },
        with: {
          paymentMethod: true,
        },
      },
      shippingTransaction: true,
    },
  });

  return Promise.all(
    ordersTemplate.map(async (order) => ({
      ...baseOrderSchema.parse(order),
      payment: order.payment,
      shippingTransaction: order.shippingTransaction,
    })),
  );
};

export const selectOrderByStripeId = async (
  stripeId: string,
): Promise<ClientOrder | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.stripeId, stripeId),
    columns: {
      paymentId: false,
    },
    with: {
      payment: {
        columns: {
          paymentMethodId: false,
        },
        with: {
          paymentMethod: true,
        },
      },
      shippingTransaction: true,
    },
  });

  return (
    orderTemplate && {
      ...baseOrderSchema.parse(orderTemplate),
      shippingTransaction: orderTemplate.shippingTransaction,
      payment: orderTemplate.payment,
    }
  );
};

export const selectOrderById = async (
  id: string,
): Promise<ClientOrder | undefined> => {
  const orderTemplate = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.id, id),
    columns: {
      paymentId: false,
    },
    with: {
      payment: {
        columns: {
          paymentMethodId: false,
        },
        with: {
          paymentMethod: true,
        },
      },
      shippingTransaction: true,
    },
  });

  return (
    orderTemplate && {
      ...baseOrderSchema.parse(orderTemplate),
      payment: orderTemplate.payment,
      shippingTransaction: orderTemplate.shippingTransaction,
    }
  );
};

export const selectOrderProductsByPaymentId = async (
  paymentId: string,
): Promise<{ id: string; products: LineItem[] } | undefined> => {
  const order = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.paymentId, paymentId),
    columns: {
      products: true,
      id: true,
    },
  });
  if (!order) {
    return;
  }
  return {
    products: baseOrderSchema.shape.products.parse(order.products),
    id: order.id,
  };
};
