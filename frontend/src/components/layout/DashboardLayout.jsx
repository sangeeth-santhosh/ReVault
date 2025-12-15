import { Outlet } from 'react-router-dom';
import PrivateSidebar from '../ui/privateSidebar.jsx';
import PrivateHeader from '../ui/privateHeader.jsx';
import PrivateMain from '../ui/privateMain.jsx';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen w-64 overflow-y-auto">
        <PrivateSidebar />
      </div>
      <div className="ml-64 flex flex-col flex-1 min-h-screen">
        <PrivateHeader />
        <PrivateMain>
          <Outlet />
        </PrivateMain>
      </div>
    </div>
  );
};

export default DashboardLayout;
