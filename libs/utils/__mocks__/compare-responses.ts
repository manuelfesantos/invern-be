interface SimplifiedError {
  message: string;
}

export const compareResponses = async (
  response: Response,
  expectedResponse: Response,
): Promise<void> => {
  const result = await response.json();
  const expectedResult = await expectedResponse.json();
  expect(result).toEqual(expectedResult);
  expect(response.status).toEqual(expectedResponse.status);
};

export const compareErrorResponses = async (
  response: Response,
  expectedResponse: Response,
): Promise<void> => {
  const result = await response.json();
  const expectedResult = await expectedResponse.json();
  expect(response.status).toEqual(expectedResponse.status);
  if (isErrorResult(result) && isErrorResult(expectedResult)) {
    try {
      compareErrors(result.error, expectedResult.error);
    } catch (error) {
      expect(true).toBe(false);
    }
  } else {
    expect(true).toBe(false);
  }
};

const compareErrors = (
  error: SimplifiedError,
  expectedError: SimplifiedError,
): void => {
  expect(error.message).toEqual(expectedError.message);
};

const isErrorResult = (
  result: unknown,
): result is { error: SimplifiedError } => {
  return (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "object" &&
    result.error !== null &&
    "message" in result.error &&
    typeof result.error.message === "string"
  );
};
