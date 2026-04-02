import { Navigate } from "react-router-dom";
import ManagerDashboard from "./ManagerDashboard";
import TeamMemberDashboard from "./TeamMemberDashboard";

export default function Dashboard() {
  const role = sessionStorage.getItem("role");

  if (!role) {
    return <Navigate to="/login" />;
  }

  return role === "manager"
    ? <ManagerDashboard />
    : <TeamMemberDashboard />;
}