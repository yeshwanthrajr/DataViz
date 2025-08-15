import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "superadmin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!localStorage.getItem("token"),
  });

  useEffect(() => {
    if (meData?.user) {
      setUser(meData.user);
    }
    setIsLoading(meLoading);
  }, [meData, meLoading]);

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    localStorage.setItem("token", data.token);
    setUser(data.user);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const register = async (email: string, password: string, name: string, role = "user") => {
    const response = await apiRequest("POST", "/api/auth/register", { 
      email, 
      password, 
      name, 
      role 
    });
    const data = await response.json();
    
    localStorage.setItem("token", data.token);
    setUser(data.user);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
