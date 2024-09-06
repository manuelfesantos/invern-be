let tokenSecret: string | null = null;
let refreshTokenSecret: string | null = null;

export const setSecrets = (secret: string, refreshSecret: string): void => {
  tokenSecret = secret;
  refreshTokenSecret = refreshSecret;
};

export const getTokenSecret = (): string => {
  if (!tokenSecret) {
    throw new Error("Token secret not set");
  }
  return tokenSecret;
};
export const getRefreshTokenSecret = (): string => {
  if (!refreshTokenSecret) {
    throw new Error("Refresh token secret not set");
  }
  return refreshTokenSecret;
};
