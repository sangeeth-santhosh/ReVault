import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const links = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Add Inventory', to: '/inventory/add' },
    { label: 'My Inventory', to: '/inventory/my' },
    { label: 'Incoming Requests', to: '/requests/incoming' },
    { label: 'My Requests', to: '/requests/my' },
    { label: 'Chats', to: '/chats' },
    { label: 'Transactions', to: '/transactions' },
    { label: 'Reports', to: '/reports' },
    { label: 'Settings', to: '/settings' },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white/70 backdrop-blur md:flex md:flex-col">
      <div className="px-6 py-4 text-lg font-semibold text-gray-800">ReVault</div>
      <nav className="flex-1 px-2 py-4 text-sm text-gray-700">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 ${
                    isActive ? 'bg-gray-100 font-semibold text-gray-900' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
