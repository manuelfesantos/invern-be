import { stringifyObject } from "@string-utils";
import { HttpMethodEnum } from "@http-entity";
import { ENV } from "@env-utils";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<Response> => {
  return await fetch("https://api.sendgrid.com/v3/mail/send", {
    body: stringifyObject({
      personalizations: [
        {
          from: {
            email: "info@invernspirit.com",
            name: "Invern Spirit",
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
        email: "info@invernspirit.com",
        name: "Invern Spirit",
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
