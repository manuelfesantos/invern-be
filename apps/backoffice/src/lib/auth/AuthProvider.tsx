import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type AuthStatus } from "./auth-context";
import type { AdminUser } from "./session";
import { login as doLogin, logout as doLogout, refreshSession } from "./session";

// Single source of truth for auth. The api client's getToken reads the same
// token this manages (via authStore), so the data layer and UI never disagree.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // On first load, try to restore the session from the refresh cookie.
  useEffect(() => {
    let active = true;
    void refreshSession().then((me) => {
      if (!active) return;
      setUser(me);
      setStatus(me ? "authenticated" : "unauthenticated");
    });
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const me = await doLogin(email, password);
    setUser(me);
    setStatus("authenticated");
  };

  const logout = async (): Promise<void> => {
    await doLogout();
    setUser(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
