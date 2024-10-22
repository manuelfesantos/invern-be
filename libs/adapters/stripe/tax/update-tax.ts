import Stripe from "stripe";
import { stripe } from "@stripe-adapter";

export const updateStripeTax = async (
  taxId: string,
  {
    name,
    description,
    active,
  }: {
    name?: string;
    description?: string;
    active?: boolean;
  },
): Promise<Stripe.TaxRate> => {
  return await stripe().taxRates.update(taxId, {
    display_name: name,
    description,
    active,
  });
};
