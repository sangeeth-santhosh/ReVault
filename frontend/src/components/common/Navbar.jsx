import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur">
      <div className="text-sm text-gray-500">Surplus Inventory Platform</div>
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="font-medium text-gray-800">{user.name || 'User'}</span>
            <button
              onClick={logout}
              className="rounded-md bg-gray-900 px-3 py-1 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-md bg-gray-900 px-3 py-1 text-white hover:bg-gray-800"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
