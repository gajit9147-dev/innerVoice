// ============================================================
// App.jsx
// Root component — wraps the entire app in:
//   ThemeProvider       → dark/light mode
//   ToastProvider       → global toast notifications
//   LiquidGlassProvider → dynamic styling palette
//   AuthProvider        → central authentication state
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { LiquidGlassProvider } from "./context/LiquidGlassProvider";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import MiniMusicPlayer from "./components/layout/MiniMusicPlayer";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import EditProfile from "./pages/EditProfile";
import Trash from "./pages/Trash";

// Handles https://innervoice4u.in/ -> /dashboard if authenticated, /login if not
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#040614] text-white">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LiquidGlassProvider>
          <AuthProvider>
            <AudioPlayerProvider>
              <BrowserRouter>
                <MiniMusicPlayer />
                <Routes>
                  {/* Root Route: If authenticated -> dashboard, If not -> login */}
                  <Route path="/" element={<RootRedirect />} />
                  <Route
                    path="/signup"
                    element={
                      <PublicOnlyRoute>
                        <Signup />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <Login />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Protected Routes (Unauthenticated users redirected to Login) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard initialTab="overview" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <Dashboard initialTab="calendar" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/edit"
                    element={
                      <ProtectedRoute>
                        <EditProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trash"
                    element={
                      <ProtectedRoute>
                        <Trash />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AudioPlayerProvider>
          </AuthProvider>
        </LiquidGlassProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
