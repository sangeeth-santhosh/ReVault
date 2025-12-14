import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar.jsx';
import Navbar from '../common/Navbar.jsx';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
