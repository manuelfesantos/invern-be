// Minimal in-memory token holder. Feature 16 (auth shell) replaces this with a
// real login flow + persistence; the api client only needs `getToken`.
let accessToken: string | null = null;

export const authStore = {
  getToken: (): string | null => accessToken,
  setToken: (token: string | null): void => {
    accessToken = token;
  },
};
