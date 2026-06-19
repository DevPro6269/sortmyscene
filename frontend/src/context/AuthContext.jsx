import { createContext, useContext, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [email, setEmail] = useState(() => localStorage.getItem("email"));

  async function authenticate(path, creds) {
    const { data } = await client.post(`/auth/${path}`, creds);
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.user.email);
    setToken(data.token);
    setEmail(data.user.email);
  }

  const login = (creds) => authenticate("login", creds);
  const register = (creds) => authenticate("register", creds);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ token, email, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
