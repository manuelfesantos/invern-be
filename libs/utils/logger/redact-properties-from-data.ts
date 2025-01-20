const redactedProperties = ["accessToken"];

//eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedactedObject = { [key: string]: any };

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
