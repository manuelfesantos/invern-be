import { stripe } from "@stripe-adapter";
import Stripe from "stripe";

export const createStripeTax = async ({
  countryCode,
  name,
  inclusive,
  percentage,
  description,
}: {
  countryCode: string;
  name: string;
  inclusive: boolean;
  percentage: number;
  description: string;
}): Promise<Stripe.TaxRate> => {
  return await stripe().taxRates.create({
    display_name: name,
    inclusive,
    percentage,
    country: countryCode,
    description,
  });
};
