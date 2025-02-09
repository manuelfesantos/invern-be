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

export const enableNextCheckoutStage = (stage: CheckoutStageEnumType): void => {
  let currentStage = contextStore.context.firstCheckoutStage;
  while (currentStage.name !== stage) {
    if (!currentStage.next) {
      throw new Error("Stage not found!");
    }
    currentStage = currentStage.next;
  }
  if (currentStage.next) {
    currentStage.next.isEnabled = true;
  }
};

export const enableCheckoutStage = (stage: CheckoutStageEnumType): void => {
  let currentStage = contextStore.context.firstCheckoutStage;
  while (currentStage.name !== stage) {
    if (!currentStage.next) {
      throw new Error("Stage not found!");
    }
    currentStage = currentStage.next;
  }
  currentStage.isEnabled = true;
};
export const disableCheckoutStage = (stage: CheckoutStageEnumType): void => {
  let currentStage = contextStore.context.firstCheckoutStage;
  while (currentStage.name !== stage) {
    if (!currentStage.next) {
      throw new Error("Stage not found!");
    }
    currentStage = currentStage.next;
  }
  currentStage.isEnabled = false;
};
