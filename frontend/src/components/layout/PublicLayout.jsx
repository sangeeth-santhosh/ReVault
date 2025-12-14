import { Outlet } from 'react-router-dom';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
