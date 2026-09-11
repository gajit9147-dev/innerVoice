// ============================================================
// client/src/components/auth/ProtectedRoute.jsx
// Guards private routes and handles startup loading state
// ============================================================

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#040614] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 blur-md opacity-70 animate-pulse" />
          </div>
          <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
