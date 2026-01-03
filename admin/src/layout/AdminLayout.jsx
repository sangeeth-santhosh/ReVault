import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="h-screen w-screen bg-[#03020a] text-white flex overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
