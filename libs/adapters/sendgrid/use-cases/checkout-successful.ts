import { sendEmail } from "../send-email";
import { buildCheckoutSuccessfulTemplate } from "../templates";
import { Order } from "@order-entity";

export const sendCheckoutSuccessfulEmail = async (
  order: Order,
): Promise<Response> => {
  return sendEmail({
    to: order.personalDetails.email,
    template: buildCheckoutSuccessfulTemplate(order),
  });
};
