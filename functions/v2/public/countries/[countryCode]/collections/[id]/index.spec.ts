import { onRequest } from "./index";
import * as CollectionModule from "@collection-module";
import {
  collectionDetailsMock,
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
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
  localLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@collection-module", () => ({
  getCollectionDetails: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({}));

describe("onRequest", () => {
  const getCollectionDetailsSpy = jest.spyOn(
    CollectionModule,
    "getCollectionDetails",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call getCollectionDetails", async () => {
    const event = {
      ...GETEventMock,
      params: {
        id: "collectionId",
      },
    };
    getCollectionDetailsSpy.mockResolvedValueOnce(
      successResponse.OK(
        "success getting collection details",
        collectionDetailsMock,
      ),
    );
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting collection details",
      collectionDetailsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getCollectionDetailsSpy).toHaveBeenCalled();
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
      expect(getCollectionDetailsSpy).not.toHaveBeenCalled();
    },
  );
  it.each([
    [errors.COLLECTION_NOT_FOUND(), "NOT_FOUND" as const],
    [
      new ZodError([{ message: "Invalid id", code: "custom", path: ["id"] }]),
      "BAD_REQUEST" as const,
    ],
    [new Error("error"), "INTERNAL_SERVER_ERROR" as const],
  ])(
    "should return error with custom code if getCollectionDetails throws error",
    async (error, code) => {
      getCollectionDetailsSpy.mockRejectedValueOnce(error);
      const event = {
        ...GETEventMock,
        params: {
          id: "collectionId",
        },
      };
      const response = await onRequest(event);

      const expectedResponse = errorResponse[code](
        error instanceof ZodError
          ? simplifyZodError(error)
          : simplifyError(error),
      );
      await compareErrorResponses(response, expectedResponse);
      expect(getCollectionDetailsSpy).toHaveBeenCalled();
    },
  );
});
