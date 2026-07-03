/**
 * Smoke test (a): a pure util, no harness needed.
 * Proves jest + ts-jest + tsconfig path aliases resolve and run.
 */
import { redactPropertiesFromData } from "@logger-utils";

describe("redactPropertiesFromData (smoke)", () => {
  it("redacts the default accessToken key", () => {
    const result = redactPropertiesFromData({
      accessToken: "secret-token",
      name: "keep-me",
    }) as Record<string, unknown>;

    expect(result.accessToken).toBe("REDACTED");
    expect(result.name).toBe("keep-me");
  });

  it("redacts recursively through nested objects and arrays", () => {
    const result = redactPropertiesFromData({
      list: [{ accessToken: "a" }, { accessToken: "b", other: 1 }],
    }) as { list: Record<string, unknown>[] };

    expect(result.list[0].accessToken).toBe("REDACTED");
    expect(result.list[1].accessToken).toBe("REDACTED");
    expect(result.list[1].other).toBe(1);
  });

  it("redacts additional caller-supplied keys", () => {
    const result = redactPropertiesFromData(
      { password: "hunter2", email: "x@y.z" },
      ["password"],
    ) as Record<string, unknown>;

    expect(result.password).toBe("REDACTED");
    expect(result.email).toBe("x@y.z");
  });
});
