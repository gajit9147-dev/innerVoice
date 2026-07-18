import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Journal from "../pages/Journal";
import Memories from "../pages/Memories";
import Dreams from "../pages/Dreams";
import Goals from "../pages/Goals";
import Favorites from "../pages/Favorites";
import Archive from "../pages/Archive";
import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/memories" element={<Memories />} />
      <Route path="/dreams" element={<Dreams />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRoutes;