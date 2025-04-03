import { stringifyObject } from "@string-utils";
import { HttpMethodEnum } from "@http-entity";
import { ENV } from "@env-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

interface SendEmailContext {
  to: string;
  subject: string;
  text: string;
  from?: string;
  fromName?: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  from = "info",
  fromName,
}: SendEmailContext): Promise<Response> => {
  logger().info("sending email", {
    useCase: LoggerUseCaseEnum.SEND_EMAIL,
    data: {
      to,
      subject,
      text,
      from,
      fromName,
    },
  });

  return await fetch("https://api.sendgrid.com/v3/mail/send", {
    body: stringifyObject({
      personalizations: [
        {
          from: {
            email: `${from}@${ENV.SENDGRID_DOMAIN}`,
            name: fromName || ENV.SENDGRID_NAME,
          },
          to: [
            {
              email: to,
              name: to,
            },
          ],
        },
      ],
      from: {
        email: `${from}@${ENV.SENDGRID_DOMAIN}`,
        name: fromName || ENV.SENDGRID_NAME,
      },
      subject,
      content: [
        {
          type: "text/plain",
          value: text,
        },
      ],
    }),
    headers: {
      Authorization: `Bearer ${ENV.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: HttpMethodEnum.POST,
  });
};
