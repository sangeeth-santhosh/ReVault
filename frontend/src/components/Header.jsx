import { Link } from 'react-router-dom';

// File: src/components/Header.jsx
const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'Contact', to: '/contact' },
];

const Header = () => {
  return (
    <header className="flex flex-col gap-6 bg-[#f7f7f7] p-10 px-30 text-sm sm:flex-row sm:items-center sm:justify-between">
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

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="cursor-pointer rounded-full bg-[#0f172a] px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Login
        </Link>
      </div>
    </header>
  );
};

export default Header;
