import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateWorkflow from "./pages/admin/CreateWorkflow";
import WorkflowDesigner from "./pages/admin/WorkflowDesigner";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import InitiatorDashboard from "./pages/initiator/InitiatorDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AuditorDashboard from "./pages/auditor/AuditorDashboard";
import HomeDashboard from "./components/HomeDashboard";
import ChatBot from "./components/ChatBot"; // Add ChatBot import

// New Modules
import NotificationCenter from "./pages/notifications/NotificationCenter";
import MeetingList from "./pages/meetings/MeetingList";
import MeetingScheduler from "./pages/meetings/MeetingScheduler";
import MeetingDetails from "./pages/meetings/MeetingDetails";
import MomCreator from "./pages/mom/MomCreator";
import MomDetails from "./pages/mom/MomDetails";

function App() {
  return (
    <>
      <Routes>

        {/* Default Route */}
        <Route path="/" element={<HomeDashboard />} />


        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Global Authenticated Routes */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
        <Route path="/meetings" element={<ProtectedRoute><MeetingList /></ProtectedRoute>} />
        <Route path="/meetings/create" element={<ProtectedRoute><MeetingScheduler /></ProtectedRoute>} />
        <Route path="/meetings/:id" element={<ProtectedRoute><MeetingDetails /></ProtectedRoute>} />
        <Route path="/meetings/:id/mom/create" element={<ProtectedRoute><MomCreator /></ProtectedRoute>} />
        <Route path="/meetings/:id/mom" element={<ProtectedRoute><MomDetails /></ProtectedRoute>} />

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

        <Route
          path="/admin/workflow-designer"
          element={
            <ProtectedRoute role="ADMIN">
              <WorkflowDesigner />
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
      <ChatBot /> {/* Render global ChatBot widget */}
    </>
  );
}

export default App;
