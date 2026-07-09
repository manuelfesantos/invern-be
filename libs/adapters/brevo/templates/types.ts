import type { EmailTemplateEnum } from "@email-entity";

export type Template<T extends Record<string, unknown>> = {
  id: (typeof EmailTemplateEnum)[keyof typeof EmailTemplateEnum];
  templateData: T;
};
