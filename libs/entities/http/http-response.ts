export const HttpStatusEnum = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpResponse = (typeof HttpStatusEnum)[keyof typeof HttpStatusEnum];

export interface ResponseContext {
  refreshToken: string;
  accessToken?: string;
  remember?: boolean;
}
