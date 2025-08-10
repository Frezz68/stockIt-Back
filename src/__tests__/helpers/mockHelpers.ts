export const createMockResponse = (): any => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

export const createMockRequest = (overrides: any = {}): any => {
  return {
    body: {},
    params: {},
    query: {},
    user: null,
    ...overrides,
  };
};
