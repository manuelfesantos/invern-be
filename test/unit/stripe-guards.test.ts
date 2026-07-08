import {
  isStripeEvent,
  isStripePaymentIntent,
  isStripeSessionExpiredEvent,
  isStripeSessionResultEvent,
} from "@stripe-entity";
import { isStripeEnvValid } from "@http-utils";
import { withTestContext } from "../harness";

const event = (type: string): unknown => ({
  id: "evt_1",
  type,
  data: { object: {} },
});

const paymentIntent = (): unknown => ({
  id: "pi_1",
  object: "payment_intent",
  amount: 1000,
  payment_method_types: ["card"],
});

describe("stripe event guards", () => {
  it("isStripeEvent validates the base event shape", () => {
    expect(isStripeEvent(event("anything"))).toBe(true);
    expect(isStripeEvent({ id: "x" })).toBe(false); // no type/data
    expect(isStripeEvent(null)).toBe(false);
    expect(isStripeEvent("nope")).toBe(false);
  });

  it("isStripeSessionResultEvent matches completed OR expired", () => {
    expect(isStripeSessionResultEvent(event("checkout.session.completed"))).toBe(
      true,
    );
    expect(isStripeSessionResultEvent(event("checkout.session.expired"))).toBe(
      true,
    );
    expect(isStripeSessionResultEvent(event("payment_intent.succeeded"))).toBe(
      false,
    );
    expect(isStripeSessionResultEvent({})).toBe(false);
  });

  it("isStripeSessionExpiredEvent matches only expired", () => {
    expect(isStripeSessionExpiredEvent(event("checkout.session.expired"))).toBe(
      true,
    );
    expect(
      isStripeSessionExpiredEvent(event("checkout.session.completed")),
    ).toBe(false);
  });

  it("isStripePaymentIntent validates the payment-intent shape", () => {
    expect(isStripePaymentIntent(paymentIntent())).toBe(true);
    expect(isStripePaymentIntent({ id: "pi_1", object: "charge" })).toBe(false);
    expect(
      isStripePaymentIntent({ ...(paymentIntent() as object), amount: "1000" }),
    ).toBe(false); // amount must be number
    expect(isStripePaymentIntent(null)).toBe(false);
  });

  it("isStripeEnvValid only accepts events tagged for this environment", async () => {
    // Harness sets ENV.STRIPE_ENV = "test".
    await withTestContext(async () => {
      const withEnv = (stripeEnv?: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ metadata: stripeEnv ? { stripeEnv } : {} }) as any;
      expect(isStripeEnvValid(withEnv("test"))).toBe(true);
      expect(isStripeEnvValid(withEnv("prod"))).toBe(false);
      expect(isStripeEnvValid(withEnv(undefined))).toBe(false);
    });
  });
});
