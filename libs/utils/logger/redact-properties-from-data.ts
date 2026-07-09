// Always-sensitive keys masked wherever they appear in a log's `data` (the
// redactor recurses into nested objects). This is defense-in-depth — the
// primary control is logging minimal, id-only data at each call site, since a
// pre-stringified value (a JSON string) is opaque to key-based redaction.
// Deliberately excludes ambiguous keys like `name` (product/tax names are not
// PII); customer identity is covered by firstName/lastName/personalDetails.
const redactedProperties = [
  "accessToken",
  "refreshToken",
  "token",
  "authorization",
  "password",
  "googleUserId",
  "email",
  "customerEmail",
  "firstName",
  "lastName",
  "personalDetails",
  "address",
  "phone",
  "phoneNumber",
];

//eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedactedObject = Record<string, any>;

export const redactPropertiesFromData = (
  data: unknown,
  props?: string[],
): unknown => {
  return redactObject(data, [...redactedProperties, ...(props || [])]);
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const redactObject = (obj: any, props: string[]): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, props));
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      if (props.includes(key)) {
        acc[key] = "REDACTED";
      } else {
        acc[key] = redactObject(obj[key], props);
      }
      return acc;
    }, {} as RedactedObject);
  }

  return obj;
};
