import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardDoctor from "../pages/DashboardDoctor";
import DashboardPatient from "../pages/DashboardPatient";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={["doctor"]}><DashboardDoctor /></ProtectedRoute>} />
        <Route path="/patient" element={<ProtectedRoute allowedRoles={["patient"]}><DashboardPatient /></ProtectedRoute>} />
        <Route path="*" element={<div className="text-center mt-5">404 – Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}