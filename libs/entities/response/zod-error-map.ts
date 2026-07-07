import * as z from "zod";

/**
 * Global, human-friendly fallback messages for Zod issues.
 *
 * Registered once at module load (before any request is handled), this only
 * FILLS THE GAP left by Zod's terse defaults ("Invalid input: expected
 * boolean, received undefined"). Any schema- or parse-level `error`/`message`
 * still wins, because Zod resolves those before the global map.
 *
 * Messages are intentionally field-name-free ("is required", not "remember is
 * required"): the field path is prepended separately by `formatZodIssue`, so
 * the final response reads "remember: is required".
 */
const article = (word: string): string =>
  /^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`;

const friendlyMessage = (issue: z.core.$ZodRawIssue): string | undefined => {
  switch (issue.code) {
    case "invalid_type":
      return issue.input === undefined
        ? "is required"
        : `must be ${article(String(issue.expected))}`;
    case "too_small":
      if (issue.origin === "string")
        return `must be at least ${issue.minimum} character(s) long`;
      if (issue.origin === "array" || issue.origin === "set")
        return `must contain at least ${issue.minimum} item(s)`;
      return `must be at least ${issue.minimum}`;
    case "too_big":
      if (issue.origin === "string")
        return `must be at most ${issue.maximum} character(s) long`;
      if (issue.origin === "array" || issue.origin === "set")
        return `must contain at most ${issue.maximum} item(s)`;
      return `must be at most ${issue.maximum}`;
    case "invalid_format":
      return issue.format ? `must be a valid ${issue.format}` : undefined;
    case "not_multiple_of":
      return `must be a multiple of ${issue.divisor}`;
    case "invalid_value":
      return Array.isArray(issue.values) && issue.values.length
        ? `must be one of: ${issue.values.join(", ")}`
        : "has an invalid value";
    case "unrecognized_keys":
      return Array.isArray(issue.keys) && issue.keys.length
        ? `has unexpected field(s): ${issue.keys.join(", ")}`
        : undefined;
    default:
      // Defer to Zod's default (or a locale) message for everything else.
      return undefined;
  }
};

z.config({ customError: (issue) => friendlyMessage(issue) });
