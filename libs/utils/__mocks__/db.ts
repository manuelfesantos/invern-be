export const bindMock = jest.fn().mockReturnValue({
  run: jest.fn(),
  first: jest.fn(),
  all: jest.fn(),
  raw: jest.fn(),
});

export const prepareStatementMock = {
  run: jest.fn(),
  bind: bindMock,
  first: jest.fn(),
  all: jest.fn(),
  raw: jest.fn(),
};
