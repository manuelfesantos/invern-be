import { Template } from "../types";

type CheckoutSuccessfulProductTemplateData = {
  image_url: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  url: string;
};

type CheckoutSuccessfulTemplateData = {
  brand_logo_url: string;
  brand_name: string;
  brand_address: string;
  order_id: string;
  order_date: string; // Consider using `Date` if you parse this
  shipping_address: string;
  customer_first_name: string;
  products: CheckoutSuccessfulProductTemplateData[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  currency: string;
  order_url: string;
  support_email: string;
};

export type CheckoutSuccessfulTemplate =
  Template<CheckoutSuccessfulTemplateData>;
