// File: src/components/Header.jsx
const navItems = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Header = () => {
  return (
    <header className="flex flex-col bg-[#f7f7f7] gap-6 sm:flex-row sm:items-center p-10 px-30 sm:justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center font-semibold tracking-tight">RV</div>
        <div>
          <div className="text-base font-semibold text-[#0f172a]">ReVault</div>
          {/* <div className="text-xs text-[#475569]">Product design & research</div> */}
        </div>
      </div>

      <nav className="flex flex-wrap gap-3 text-[#1f2937]">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] shadow-sm hover:-translate-y-0.5 transition"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {/* <div className="hidden sm:block text-[#0f172a]">hello@revault.studio</div> */}
        <button className="cursor-pointer px-4 py-2 rounded-full bg-[#0f172a] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
          Login
        </button>
      </div>
    </header>
  );
};

export default Header;
