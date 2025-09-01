import type { CookieName} from "@http-entity";
import { HttpStatusEnum } from "@http-entity";
import type { CheckoutStageName } from "@checkout-session-entity";
import { successResponse } from "@response-entity";
import {
  getClientCheckoutStages,
  getRemoveCookieNamesFromInvalidCheckoutStage,
} from "@context-utils";
import { deleteCookieFromResponse } from "@http-utils";

export class CustomError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class CheckoutError extends CustomError {
  private readonly _invalidCheckoutStage: CheckoutStageName;

  constructor(message: string, invalidCheckoutStage: CheckoutStageName) {
    super(message, HttpStatusEnum.BAD_REQUEST);
    this._invalidCheckoutStage = invalidCheckoutStage;
  }

  private get invalidCheckoutStage(): CheckoutStageName {
    return this._invalidCheckoutStage;
  }

  private get invalidCookies(): CookieName[] {
    return getRemoveCookieNamesFromInvalidCheckoutStage(
      this.invalidCheckoutStage,
    );
  }

  get errorResponse(): Response {
    const invalidCookies = this.invalidCookies;

    const response = successResponse.OK(this.message, {
      availableCheckoutStages: getClientCheckoutStages(),
    });
    invalidCookies.forEach((cookie) =>
      deleteCookieFromResponse(response, cookie),
    );
    return response;
  }
}
