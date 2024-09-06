export type ProtectedModuleFunction = (
  tokens: { refreshToken: string; accessToken?: string },
  remember?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<Response>;
