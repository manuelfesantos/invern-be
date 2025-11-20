import { contextStore } from "../context-store";
import { validations } from "./validations";
import { firstStage } from "./stages";
import type {
  CheckoutStageName,
  CheckoutStageNameEnum,
} from "@checkout-session-entity";
import { checkoutStageToCookie } from "@checkout-session-entity";
import type { CheckoutStage, ClientCheckoutStage } from "./types";
import { clientCheckoutStageSchema } from "./types";
import type { CookieName } from "@http-entity";
import { errors } from "@error-handling-utils";

export const setupCheckoutStages = async (): Promise<void> => {
  let stage: CheckoutStage = firstStage;

  enableCheckoutStage(stage.name);

  while (stage.next) {
    if (await validations[stage.name]()) {
      enableCheckoutStage(stage.next.name);
    } else {
      return;
    }
    stage = stage.next;
  }
};

export const getClientCheckoutStages = (): ClientCheckoutStage[] => {
  const stages: CheckoutStage[] = [];
  const { isLoggedIn, firstCheckoutStage } = contextStore.context;
  let currentStage: CheckoutStage | undefined = firstCheckoutStage;
  while (currentStage) {
    stages.push({
      name: currentStage.name,
      isEnabled: currentStage.isEnabled,
      showWhenLoggedIn: currentStage.showWhenLoggedIn,
      title: currentStage.title,
    });
    currentStage = currentStage.next;
  }
  const stagesToShow = isLoggedIn
    ? stages.filter((stage) => stage.showWhenLoggedIn)
    : stages;

  return stagesToShow.map((stage) => clientCheckoutStageSchema.parse(stage));
};

export const getNextClientCheckoutStage = (
  stage: Omit<CheckoutStageName, typeof CheckoutStageNameEnum.REVIEW>,
): ClientCheckoutStage => {
  const { firstCheckoutStage } = contextStore.context;
  let currentStage: CheckoutStage | undefined = firstCheckoutStage;
  while (currentStage) {
    if (currentStage.name === stage) {
      return {
        name: currentStage.name,
        isEnabled: currentStage.isEnabled,
        title: currentStage.title,
      };
    }
    currentStage = currentStage.next;
  }
  throw errors.GENERIC("Next checkout stage not found");
};

export const enableNextCheckoutStage = (stage: CheckoutStageName): void =>
  enableCheckoutStage(stage, true);

export const enableCheckoutStage = (
  stage: CheckoutStageName,
  next?: boolean,
): void => {
  const checkoutStage = getCheckoutStage(stage);
  if (next) {
    if (checkoutStage.next) {
      handleEnableCheckoutStage(checkoutStage.next);
    }
  } else {
    handleEnableCheckoutStage(checkoutStage);
  }
};

export const disableCheckoutStage = (stage: CheckoutStageName): void => {
  const checkoutStage = getCheckoutStage(stage);
  handleDisableCheckoutStage(checkoutStage);
};

export const disableNextCheckoutStage = (stage: CheckoutStageName): void => {
  const checkoutStage = getCheckoutStage(stage);
  if (checkoutStage.next) {
    handleDisableCheckoutStage(checkoutStage.next);
  }
};

const handleEnableCheckoutStage = (stage: CheckoutStage): void => {
  stage.isEnabled = true;
  while (stage.autoEnableNextStage && stage.next) {
    stage = stage.next;
    stage.isEnabled = true;
  }
};

const handleDisableCheckoutStage = (stage: CheckoutStage): void => {
  stage.isEnabled = false;
  while (stage.next) {
    stage = stage.next;
    stage.isEnabled = false;
  }
};

export const isCheckoutStageEnabled = (stage: CheckoutStageName): boolean => {
  const checkoutStage = getCheckoutStage(stage);
  return checkoutStage.isEnabled;
};

const getCheckoutStage = (stage: CheckoutStageName): CheckoutStage => {
  let currentStage = contextStore.context.firstCheckoutStage;
  while (currentStage.name !== stage) {
    if (!currentStage.next) {
      throw new Error("Stage not found!");
    }
    currentStage = currentStage.next;
  }
  return currentStage;
};

export const getRemoveCookieNamesFromInvalidCheckoutStage = (
  invalidCheckoutStage: CheckoutStageName,
): CookieName[] => {
  const cookieNames: CookieName[] = [];
  let checkoutStage: CheckoutStage | undefined =
    getCheckoutStage(invalidCheckoutStage);

  disableNextCheckoutStage(checkoutStage.name);

  while (checkoutStage) {
    const cookieName = checkoutStageToCookie[checkoutStage.name];
    if (cookieName) {
      cookieNames.push(cookieName);
    }
    checkoutStage = checkoutStage.next;
  }

  return cookieNames;
};

export * from "./error-handler";
