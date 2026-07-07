import * as z from "zod";
import "@response-entity"; // registers the global error map (side-effect) + exports
import { formatZodIssue } from "@response-entity";

const messagesFor = (schema: z.ZodType, value: unknown): string[] => {
  const res = schema.safeParse(value);
  if (res.success) throw new Error("expected the parse to fail");
  return res.error.issues.map(formatZodIssue);
};

describe("zod error messages", () => {
  it("prefixes the field path with a friendly required message", () => {
    const schema = z.object({ remember: z.boolean() });
    expect(messagesFor(schema, {})).toEqual(["remember: is required"]);
  });

  it("reports a wrong type with a readable article", () => {
    const schema = z.object({ remember: z.boolean() });
    expect(messagesFor(schema, { remember: "yes" })).toEqual([
      "remember: must be a boolean",
    ]);
  });

  it("renders nested paths and array indices", () => {
    const schema = z.object({
      items: z.array(z.object({ qty: z.number() })),
    });
    expect(
      messagesFor(schema, { items: [{ qty: 1 }, { qty: "x" }] }),
    ).toEqual(["items[1].qty: must be a number"]);
  });

  it("keeps schema-level custom messages (precedence over the global map)", () => {
    const schema = z.object({
      role: z.string({ error: "Invalid role" }),
    });
    expect(messagesFor(schema, { role: 123 })).toEqual(["role: Invalid role"]);
  });

  it("gives friendly format and length messages", () => {
    const schema = z.object({
      email: z.email(),
      password: z.string().min(8),
    });
    const msgs = messagesFor(schema, { email: "nope", password: "x" });
    expect(msgs).toContain("email: must be a valid email");
    expect(msgs).toContain(
      "password: must be at least 8 character(s) long",
    );
  });
});
