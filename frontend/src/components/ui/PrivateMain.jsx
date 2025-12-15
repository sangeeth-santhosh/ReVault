import React from "react";
import { Outlet } from "react-router-dom";

const AdminMain = () => {
  return (
    <main className="flex-1 bg-paleBg overflow-y-auto">
      {/* Container for all main content with padding */}
      <div className="px-8 py-6 space-y-6">
        <Outlet />

      </div>
    </main>
  );
};

export default AdminMain;
