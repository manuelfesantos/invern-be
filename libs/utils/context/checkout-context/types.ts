import { CheckoutStageEnumType } from "@checkout-session-entity";
import { z } from "zod";

export interface CheckoutStage {
  name: CheckoutStageEnumType;
  next?: CheckoutStage;
  showWhenLoggedIn?: boolean;
  isEnabled: boolean;
}

export const clientCheckoutStageSchema = z.object({
  name: z.string(),
  isEnabled: z.boolean(),
});

export type ClientCheckoutStage = z.infer<typeof clientCheckoutStageSchema>;
