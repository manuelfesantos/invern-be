export const compareResponses = async (
  response: Response,
  expectedResponse: Response,
): Promise<void> => {
  const result = await response.json();
  const expectedResult = await expectedResponse.json();
  expect(result).toEqual(expectedResult);
  expect(response.status).toEqual(expectedResponse.status);
};
