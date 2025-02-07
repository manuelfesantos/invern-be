import { onRequest } from "./index";
import { HttpMethodEnum } from "@http-entity";
import {
  compareErrorResponses,
  compareResponses,
  GETEventMock,
} from "@mocks-utils";
import { errorResponse, successResponse } from "@response-entity";

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({}));

describe("onRequest", () => {
  it.each([HttpMethodEnum.PUT, HttpMethodEnum.DELETE, HttpMethodEnum.POST])(
    "should return error if request method is not allowed",
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
    },
  );
  it("should return a message when request method is GET", async () => {
    const event = {
      ...GETEventMock,
    };
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK("Welcome to Invern Spirit!");
    await compareResponses(response, expectedResponse);
  });
});
