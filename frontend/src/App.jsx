import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { token, email, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <Link to="/" className="text-xl font-bold">SortMyScene</Link>
        {token && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">{email}</span>
            <button onClick={logout} className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300">
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-4xl p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
