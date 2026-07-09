import { createContext } from "react";
import type { AdminUser } from "./session";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthValue {
  user: AdminUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);
