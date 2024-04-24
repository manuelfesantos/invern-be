import { z } from "zod";

export const productSchema = z.object({
  id: z
    .string({ required_error: "id is required" })
    .uuid({ message: "Invalid id" }),
  name: z.string({ required_error: "name is required" }),
  price: z.number({ required_error: "price is required" }),
  description: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;
