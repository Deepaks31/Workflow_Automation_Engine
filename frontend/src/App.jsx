import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateWorkflow from "./pages/admin/CreateWorkflow";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import InitiatorDashboard from "./pages/initiator/InitiatorDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AuditorDashboard from "./pages/auditor/AuditorDashboard";
import HomeDashboard from "./components/HomeDashboard";

function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route path="/" element={<HomeDashboard />} />


      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-workflow"
        element={
          <ProtectedRoute role="ADMIN">
            <CreateWorkflow />
          </ProtectedRoute>
        }
      />

      {/* Initiator */}
      <Route
        path="/initiator"
        element={
          <ProtectedRoute role="INITIATOR">
            <InitiatorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Approver */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute role="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance"
        element={
          <ProtectedRoute role="FINANCE">
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />


      {/* Auditor */}
      <Route
        path="/auditor"
        element={
          <ProtectedRoute role="AUDITOR">
            <AuditorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}

export default App;
