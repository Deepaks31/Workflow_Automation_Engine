import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const user = localStorage.getItem("user");
  const userRole = localStorage.getItem("role");

  // Not logged in
  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }
  const parsedUser = JSON.parse(user);

  if (parsedUser.status !== "ACTIVE") {
  return <Navigate to="/login" replace />;
}


  return children;
}
