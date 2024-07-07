import { z, ZodError } from "zod";
import { HttpResponseEnum } from "@http-entity";
import { buildResponse } from "./response";
import { AdapterError } from "@error-handling-utils";

export const errorResponse = {
  BAD_REQUEST: (error?: unknown) =>
    buildErrorResponse(
      error || simplifyError(new Error("bad http request")),
      HttpResponseEnum.BAD_REQUEST,
    ),
  UNAUTHORIZED: (error?: unknown) =>
    buildErrorResponse(
      error || simplifyError(new Error("unauthorized")),
      HttpResponseEnum.UNAUTHORIZED,
    ),
  FORBIDDEN: (error?: unknown) =>
    buildErrorResponse(
      error || prepareError("forbidden"),
      HttpResponseEnum.FORBIDDEN,
    ),
  NOT_FOUND: (error?: unknown) =>
    buildErrorResponse(
      error || prepareError("not found"),
      HttpResponseEnum.NOT_FOUND,
    ),
  METHOD_NOT_ALLOWED: (error?: unknown) =>
    buildErrorResponse(
      error || prepareError("method not allowed"),
      HttpResponseEnum.METHOD_NOT_ALLOWED,
    ),
  CONFLICT: (error?: unknown) =>
    buildErrorResponse(
      error || prepareError("conflict"),
      HttpResponseEnum.CONFLICT,
    ),
  INTERNAL_SERVER_ERROR: (error?: unknown) =>
    buildErrorResponse(
      error || prepareError("internal server error"),
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
} as const;

export const prepareError = (message: string): SimpleError => {
  return simplifyError(new Error(message));
};

interface SimplifiedZodError {
  issues: z.ZodIssue[];
  name: string;
  cause: unknown;
  stack?: string;
  message: string;
}

interface SimpleError {
  name: string;
  cause: unknown;
  stack?: string;
  message: string;
}

export const generateErrorResponse = (error: unknown): Response => {
  if (error instanceof z.ZodError) {
    return errorResponse.BAD_REQUEST(simplifyZodError(error));
  }

  if (error instanceof AdapterError) {
    return buildErrorResponse(simplifyError(error), Number(error.code));
  }

  if (error instanceof Error && error.message.includes("JSON")) {
    return errorResponse.BAD_REQUEST(simplifyError(error));
  }
  if (error instanceof Error) {
    return errorResponse.INTERNAL_SERVER_ERROR(simplifyError(error));
  }

  return errorResponse.INTERNAL_SERVER_ERROR(error);
};

export const buildErrorResponse = (error: unknown, status: number): Response =>
  buildResponse({ error }, { status });

export const simplifyZodError = (error: ZodError): SimplifiedZodError => {
  return {
    issues: error.issues,
    name: error.name,
    cause: error.cause,
    stack: error.stack,
    message: error.message,
  };
};

export const simplifyError = (error: Error): SimpleError => {
  return {
    name: error.name,
    cause: error.cause,
    stack: error.stack,
    message: error.message,
  };
};
