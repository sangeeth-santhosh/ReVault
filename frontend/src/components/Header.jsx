import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

// File: src/components/Header.jsx
const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'Contact', to: '/contact' },
  { label: 'About', to: '/about' },
];

const Header = ({ compact = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const close = () => setOpen(false);

  if (compact) {
    return (
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white/80 backdrop-blur">
        <div className="text-sm font-semibold text-gray-800">ReVault</div>
        <div className="relative flex items-center gap-3 text-sm">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-gray-800 shadow-sm hover:border-gray-300"
              >
                <span className="font-medium">{user.name || 'Profile'}</span>
                <span className="text-gray-500">▾</span>
              </button>
              {open ? (
                <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                  <Link
                    to="/dashboard"
                    onClick={close}
                    className="block px-3 py-2 text-gray-800 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md bg-gray-900 px-3 py-1 text-white hover:bg-gray-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-gray-200 px-3 py-1 text-gray-800 hover:border-gray-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-6 pt-10 bg-[#f7f7f7] text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black font-semibold tracking-tight text-white">RV</div>
        <div>
          <div className="text-base font-semibold text-[#0f172a]">ReVault</div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-3 text-[#1f2937]">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="relative flex items-center gap-3">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-[#0f172a] px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="font-semibold">{user.name || 'Profile'}</span>
              <span className="text-sm text-gray-200">▾</span>
            </button>
            {open ? (
              <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                <Link
                  to="/dashboard"
                  onClick={close}
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="cursor-pointer rounded-full bg-[#0f172a] px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-[#e2e8f0] bg-white px-4 py-2 text-[#0f172a] shadow-sm transition hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
