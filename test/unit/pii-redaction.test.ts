/**
 * Log redaction: always-sensitive keys are masked wherever they appear (incl.
 * nested + in arrays), and non-sensitive keys (ids, product/tax names) pass
 * through. This is the defense-in-depth net behind the id-only logging at call
 * sites.
 */
import { redactPropertiesFromData } from "../../libs/utils/logger/redact-properties-from-data";

describe("redactPropertiesFromData", () => {
  it("masks PII / credential keys at any depth", () => {
    const redacted = redactPropertiesFromData({
      orderId: "o1",
      accessToken: "a",
      refreshToken: "r",
      password: "p",
      googleUserId: "g",
      order: {
        personalDetails: { email: "x@y.com", firstName: "A", lastName: "B" },
        address: { street: "1 Main", city: "Lisbon" },
        phone: "911",
      },
      recipients: [{ email: "a@b.com" }, { email: "c@d.com" }],
    }) as Record<string, unknown>;

    expect(redacted.accessToken).toBe("REDACTED");
    expect(redacted.refreshToken).toBe("REDACTED");
    expect(redacted.password).toBe("REDACTED");
    expect(redacted.googleUserId).toBe("REDACTED");
    const order = redacted.order as Record<string, unknown>;
    expect(order.personalDetails).toBe("REDACTED");
    expect(order.address).toBe("REDACTED");
    expect(order.phone).toBe("REDACTED");
    const recipients = redacted.recipients as { email: string }[];
    expect(recipients.every((r) => r.email === "REDACTED")).toBe(true);
  });

  it("leaves non-sensitive keys (ids, names) intact", () => {
    const redacted = redactPropertiesFromData({
      orderId: "o1",
      id: "p1",
      name: "Earth Jar", // product name — NOT PII, must survive
      type: "checkout.session.completed",
      count: 3,
    }) as Record<string, unknown>;

    expect(redacted).toEqual({
      orderId: "o1",
      id: "p1",
      name: "Earth Jar",
      type: "checkout.session.completed",
      count: 3,
    });
  });
});
