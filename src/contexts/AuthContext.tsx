import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "admin" | "guest" | null;

interface AuthContextType {
  token: string | null;
  role: Role;
  username: string | null;
  apiKey: string | null;
  login: (token: string, role: Role, username: string, apiKey?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  username: null,
  apiKey: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<Role>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
         if (res.ok) return res.json();
         throw new Error("Invalid token");
      })
      .then(data => {
         setRole(data.role);
         setUsername(data.username);
         setApiKey(data.apiKey || null);
         setLoading(false);
      })
      .catch(() => {
         localStorage.removeItem("token");
         setToken(null);
         setRole(null);
         setUsername(null);
         setApiKey(null);
         setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newRole: Role, newUsername: string, newApiKey?: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
    setApiKey(newApiKey || null);
  };

  const logout = () => {
    if (token) {
       fetch("/api/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    }
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
    setUsername(null);
    setApiKey(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, username, apiKey, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
