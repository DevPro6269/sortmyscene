import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Banner from "../components/Banner";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login({ email, password });
      else await register({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">{mode === "login" ? "Log in" : "Create account"}</h1>
      <div className="mb-3"><Banner type="error" onClose={() => setError("")}>{error}</Banner></div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="password" required placeholder="Password (min 6 chars)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <button type="submit" disabled={loading}
          className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Register"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-4 text-sm text-indigo-600 hover:underline">
        {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
      </button>
    </div>
  );
}
