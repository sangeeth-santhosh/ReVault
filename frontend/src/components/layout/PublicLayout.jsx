import { Outlet } from 'react-router-dom';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';

const PublicLayout = () => {
  return (
    <div className="min-h-screen px-30 bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto mt-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
