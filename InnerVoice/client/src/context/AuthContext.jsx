// ============================================================
// client/src/context/AuthContext.jsx
// Central Production Authentication State & Session Hydration
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  loginUser,
  registerUser,
  googleAuthUser,
  appleAuthUser,
  getMe,
  logoutUser,
} from "../api/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Loading is true initially while session is restored from backend
  const [loading, setLoading] = useState(true);

  // Synchronize session token and user profile
  const setSession = (token, userData) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  // Clear session token and user profile
  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Hydrate & verify session with backend on application startup
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      clearSession();
      setLoading(false);
      return null;
    }

    try {
      const res = await getMe();
      if (res.data?.user) {
        setSession(token, res.data.user);
        return res.data.user;
      } else {
        clearSession();
        return null;
      }
    } catch {
      // If token expired or invalid, purge session cleanly
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login with Email + Password
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.data?.token && res.data?.user) {
      setSession(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || "Login failed");
  };

  // Signup with Email + Password
  const signup = async (userData) => {
    const res = await registerUser(userData);
    if (res.data?.token && res.data?.user) {
      setSession(res.data.token, res.data.user);
      return res.data;
    }
    return res.data;
  };

  // Authenticate with Google
  const loginWithGoogle = async (idToken, extraPayload = {}) => {
    const res = await googleAuthUser({ id_token: idToken, ...extraPayload });
    if (res.data?.token && res.data?.user) {
      setSession(res.data.token, res.data.user);
      return res.data;
    }
    return res.data;
  };

  // Authenticate with Apple
  const loginWithApple = async (payload) => {
    const res = await appleAuthUser(payload);
    if (res.data?.token && res.data?.user) {
      setSession(res.data.token, res.data.user);
      return res.data;
    }
    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network failures on logout
    } finally {
      clearSession();
    }
  };

  const isAuthenticated = Boolean(user && localStorage.getItem("token"));

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      signup,
      register: signup,
      loginWithGoogle,
      loginWithApple,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading, isAuthenticated, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}