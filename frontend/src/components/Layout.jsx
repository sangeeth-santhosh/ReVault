import Header from './Header.jsx';
import Outlet from './Outlet.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = () => {
	return (
		<>
			<div className="font-sans text-slate-800 h-screen">
				<div className="w-full h-screen bg-white shadow-2xl flex overflow-hidden max-md:flex-col">
					<Sidebar />
					<main className="flex-1 p-6 overflow-y-auto min-h-0 max-sm:p-4">
						<Header />
						<Outlet />
					</main>
				</div>
			</div>
		</>
	);
};

export default Layout;
