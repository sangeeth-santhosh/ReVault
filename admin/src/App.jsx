import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Requests from "./pages/Requests";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import { getAdminSession } from "./services/adminService";

const RequireAdmin = ({ children }) => {
  const session = getAdminSession();
  if (!session?.token || session?.user?.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />

      <Route
        element={(
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        )}
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/requests" element={<Requests />} />
        <Route path="/admin/transactions" element={<Transactions />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
