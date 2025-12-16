import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = (user?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex-shrink-0 h-16 bg-white shadow-sm flex items-center justify-start px-8 border-b border-slate-100 z-0">
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden sm:block">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="pl-10 pr-4 py-2 text-xs rounded-full bg-slate-50 outline-none border border-slate-200 w-56"
            placeholder="Search"
          />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="hidden sm:inline text-left">
              <span className="block text-xs text-slate-500">Signed in</span>
              <span className="block text-sm font-semibold text-slate-900">{user?.name || "User"}</span>
            </span>
            <span className="text-slate-500">▾</span>
          </button>
          {open ? (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
              <button
                onClick={() => {
                  navigate("/");
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-slate-800 hover:bg-slate-50"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="block w-full px-3 py-2 text-left text-slate-800 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
