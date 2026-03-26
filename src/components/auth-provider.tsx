"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthEnabled: boolean | null; // null = still checking
  isLoggingIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthEnabled, setIsAuthEnabled] = useState<boolean | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setIsAuthEnabled(data.authEnabled);
        setIsAuthenticated(data.authenticated);
      } catch {
        setIsAuthEnabled(false);
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoggingIn(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Login failed");
        }

        setIsAuthenticated(true);
      } catch (err) {
        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAuthEnabled, isLoggingIn, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
