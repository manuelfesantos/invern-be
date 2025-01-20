const redactedProperties = ["accessToken"];

export const redactPropertiesFromData = (
  body: unknown,
  props?: string[],
): unknown => {
  let dataLogObject = structuredClone(body);
  const propsToRedact = [...redactedProperties, ...(props || [])];
  for (const prop in propsToRedact) {
    if (
      dataLogObject &&
      typeof dataLogObject === "object" &&
      prop in dataLogObject
    ) {
      dataLogObject = Object.assign({}, dataLogObject, { [prop]: "REDACTED" });
    }
  }

  return dataLogObject;
};
