import { contextStore } from "../context-store";
import { validations } from "./validations";
import { firstStage } from "./stages";
import { CheckoutStageEnumType } from "@checkout-session-entity";
import {
  CheckoutStage,
  ClientCheckoutStage,
  clientCheckoutStageSchema,
} from "./types";

export const setupCheckoutStages = async (): Promise<void> => {
  let stage = firstStage;

  enableCheckoutStage(stage.name);
  while (stage?.next) {
    if (await validations[stage.name]()) {
      enableCheckoutStage(stage.next.name);
    } else {
      break;
    }
    stage = stage.next;
  }
};

export const getClientCheckoutStages = (): ClientCheckoutStage[] => {
  const stages: CheckoutStage[] = [];
  const { isLoggedIn, firstCheckoutStage } = contextStore.context;
  let currentStage = firstCheckoutStage;
  while (currentStage.next) {
    stages.push({
      name: currentStage.name,
      isEnabled: currentStage.isEnabled,
      showWhenLoggedIn: currentStage.showWhenLoggedIn,
      title: currentStage.title,
    });
    currentStage = currentStage.next;
  }
  stages.push(currentStage);
  const stagesToShow = isLoggedIn
    ? stages.filter((stage) => stage.showWhenLoggedIn)
    : stages;

  return stagesToShow.map((stage) => clientCheckoutStageSchema.parse(stage));
};

export const enableNextCheckoutStage = (stage: CheckoutStageEnumType): void =>
  enableCheckoutStage(stage, true);

export const enableCheckoutStage = (
  stage: CheckoutStageEnumType,
  next?: boolean,
): void => {
  const checkoutStage = getCheckoutStage(stage);
  if (next) {
    checkoutStage.next && handleEnableCheckoutStage(checkoutStage.next);
  } else {
    handleEnableCheckoutStage(checkoutStage);
  }
};

export const disableCheckoutStage = (stage: CheckoutStageEnumType): void => {
  const checkoutStage = getCheckoutStage(stage);
  handleDisableCheckoutStage(checkoutStage);
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

export const isCheckoutStageEnabled = (
  stage: CheckoutStageEnumType,
): boolean => {
  const checkoutStage = getCheckoutStage(stage);
  return checkoutStage.isEnabled;
};

const getCheckoutStage = (stage: CheckoutStageEnumType): CheckoutStage => {
  let currentStage = contextStore.context.firstCheckoutStage;
  while (currentStage.name !== stage) {
    if (!currentStage.next) {
      throw new Error("Stage not found!");
    }
    currentStage = currentStage.next;
  }
  return currentStage;
};
