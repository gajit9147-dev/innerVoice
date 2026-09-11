// ============================================================
// client/src/components/auth/PublicOnlyRoute.jsx
// Redirects authenticated users away from Login/Signup to Dashboard
// ============================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#040614] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
