import { onRequest } from "./index";
import * as CollectionModule from "@collection-module";
import {
  collectionsMock,
  compareErrorResponses,
  compareResponses,
  GETEventMock,
} from "@mocks-utils";
import {
  errorResponse,
  simplifyError,
  simplifyZodError,
  successResponse,
} from "@response-entity";
import { HttpMethodEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@collection-module", () => ({
  getAllCollections: jest.fn(),
}));

describe("onRequest", () => {
  const getAllCollectionsSpy = jest.spyOn(
    CollectionModule,
    "getAllCollections",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call getAllCollections", async () => {
    const event = {
      ...GETEventMock,
    };
    getAllCollectionsSpy.mockResolvedValueOnce(
      successResponse.OK("success getting all collections", collectionsMock),
    );
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting all collections",
      collectionsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getAllCollectionsSpy).toHaveBeenCalled();
  });
  it.each([HttpMethodEnum.POST, HttpMethodEnum.DELETE, HttpMethodEnum.PUT])(
    "should return METHOD_NOT_ALLOWED if method is %s",
    async (method) => {
      const event = {
        ...GETEventMock,
        request: {
          ...GETEventMock.request,
          method,
        },
      };
      const response = await onRequest(event);
      const expectedResponse = errorResponse.METHOD_NOT_ALLOWED();
      await compareErrorResponses(response, expectedResponse);
      expect(getAllCollectionsSpy).not.toHaveBeenCalled();
    },
  );
  it.each([
    [errors.COLLECTION_NOT_FOUND(), "NOT_FOUND" as const],
    [new Error("error"), "INTERNAL_SERVER_ERROR" as const],
    [
      new ZodError([{ message: "Invalid id", code: "custom", path: ["id"] }]),
      "BAD_REQUEST" as const,
    ],
    [errors.DATABASE_NOT_INITIALIZED(), "INTERNAL_SERVER_ERROR" as const],
  ])(
    "should return %s if getAllCollections throws error",
    async (error, code) => {
      const event = {
        ...GETEventMock,
      };
      getAllCollectionsSpy.mockRejectedValueOnce(error);
      const response = await onRequest(event);
      const expectedResponse = errorResponse[code](
        error instanceof ZodError
          ? simplifyZodError(error)
          : simplifyError(error),
      );
      await compareErrorResponses(response, expectedResponse);
      expect(getAllCollectionsSpy).toHaveBeenCalled();
    },
  );
});
