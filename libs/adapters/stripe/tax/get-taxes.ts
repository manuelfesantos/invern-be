import Stripe from "stripe";
import { stripe } from "@stripe-adapter";

export const getStripeTaxes = async (): Promise<Stripe.TaxRate[]> => {
  const taxList = await stripe().taxRates.list();
  return taxList.data;
};
