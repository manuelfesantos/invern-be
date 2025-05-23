import { getAllOrders } from "@order-module";
import { successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { Order } from "@order-entity";

const NO_ORDERS = 0;

const GET: PagesFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  let orders: Order[] = [];
  let count: number = NO_ORDERS;
  const userId = searchParams.get("userId");
  const paymentId = searchParams.get("paymentId");
  const shippingTransactionId = searchParams.get("shippingTransactionId");
  const stripeId = searchParams.get("stripeId");
  if (userId) {
    const result = await getAllOrders("userId", userId);
    count = result.count;
    orders = result.orders;
  } else if (paymentId) {
    const result = await getAllOrders("paymentId", paymentId);
    count = result.count;
    orders = result.orders;
  } else if (shippingTransactionId) {
    const result = await getAllOrders(
      "shippingTransactionId",
      shippingTransactionId,
    );
    count = result.count;
    orders = result.orders;
  } else if (stripeId) {
    const result = await getAllOrders("stripeId", stripeId);
    count = result.count;
    orders = result.orders;
  } else {
    const result = await getAllOrders();
    count = result.count;
    orders = result.orders;
  }

  return successResponse.OK("Orders fetched successfully", { count, orders });
};

export const onRequest = requestHandler({ GET });
