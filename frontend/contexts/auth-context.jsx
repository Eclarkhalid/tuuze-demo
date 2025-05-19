"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.data.user);
        Toast.success("Registration successful");
        return true;
      } else {
        Toast.error(data.message || "Registration failed");
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      Toast.error("An error occurred during registration");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.data.user);
        Toast.success("Login successful");
        return true;
      } else {
        Toast.error(data.message || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.error("An error occurred during login");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST"
      });

      if (res.ok) {
        setUser(null);
        Toast.success("Logged out successfully");
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Toast.error("An error occurred during logout");
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await res.json();

      if (res.ok) {
        Toast.success("Password reset instructions sent to your email");
        return true;
      } else {
        Toast.error(data.message || "Failed to send password reset");
        return false;
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Toast.error("An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.data.user);
        Toast.success("Password reset successful");
        router.push("/");
        return true;
      } else {
        Toast.error(data.message || "Failed to reset password");
        return false;
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Toast.error("An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
