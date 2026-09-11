// ============================================================
// App.jsx
// Root component — wraps the entire app in:
//   ThemeProvider       → dark/light mode
//   ToastProvider       → global toast notifications
//   LiquidGlassProvider → dynamic styling palette
//   AuthProvider        → central authentication state
// ============================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { LiquidGlassProvider } from "./context/LiquidGlassProvider";
import { AuthProvider } from "./context/AuthContext";

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

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LiquidGlassProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public / Landing Routes */}
                <Route path="/" element={<Signup />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes (Unauthenticated users redirected to Login) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
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
          </AuthProvider>
        </LiquidGlassProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
