export type Template<T extends Record<string, unknown>> = {
  id: string;
  from?: string;
  fromName?: string;
  templateData: T;
};
