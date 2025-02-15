import { CheckoutStageName } from "@checkout-session-entity";
import { z } from "zod";

export interface CheckoutStage {
  name: CheckoutStageName;
  title: string;
  next?: CheckoutStage;
  showWhenLoggedIn?: boolean;
  isEnabled: boolean;
  autoEnableNextStage?: boolean;
}

export const clientCheckoutStageSchema = z.object({
  name: z.string(),
  isEnabled: z.boolean(),
  title: z.string(),
});

export type ClientCheckoutStage = z.infer<typeof clientCheckoutStageSchema>;
