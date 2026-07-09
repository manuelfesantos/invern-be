import { stringifyObject } from "@string-utils";
import { HttpMethodEnum } from "@http-entity";
import { ENV } from "@env-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import type { Template } from "./templates";

type SendEmailContext<T extends Record<string, unknown>> = {
  to: string;
  template: Template<T>;
};

export const sendEmail = async <T extends Record<string, unknown>>({
  to,
  template,
}: SendEmailContext<T>): Promise<Response> => {
  logger().info("sending email", {
    useCase: LoggerUseCaseEnum.SEND_EMAIL,
    // Recipient address is PII — log the template, not who it went to.
    data: {
      templateId: template.id,
    },
  });

  return fetch("https://api.brevo.com/v3/smtp/email", {
    body: stringifyObject({
      to: [
        {
          email: to,
          name: to,
        },
      ],
      templateId: template.id,
      params: template.templateData,
    }),
    headers: {
      accept: "application/json",
      "api-key": ENV.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    method: HttpMethodEnum.POST,
  });
};
