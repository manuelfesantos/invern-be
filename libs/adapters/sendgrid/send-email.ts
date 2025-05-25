import { stringifyObject } from "@string-utils";
import { HttpMethodEnum } from "@http-entity";
import { ENV } from "@env-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { Template } from "./templates";

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
    data: {
      to,
      from: template.from,
      fromName: template.fromName,
    },
  });

  return await fetch("https://api.sendgrid.com/v3/mail/send", {
    body: stringifyObject({
      personalizations: [
        {
          from: {
            email: template.from,
            name: template.fromName,
          },
          to: [
            {
              email: to,
              name: to,
            },
          ],
          dynamic_template_data: template.templateData,
        },
      ],
      from: {
        email: template.from,
        name: template.fromName,
      },
      template_id: template.id,
    }),
    headers: {
      Authorization: `Bearer ${ENV.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: HttpMethodEnum.POST,
  });
};
