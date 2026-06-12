import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "admin" | "guest" | null;

interface AuthContextType {
  token: string | null;
  role: Role;
  login: (token: string, role: Role) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<Role>(null);
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
         setLoading(false);
      })
      .catch(() => {
         localStorage.removeItem("token");
         setToken(null);
         setRole(null);
         setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newRole: Role) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    if (token) {
       fetch("/api/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    }
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
