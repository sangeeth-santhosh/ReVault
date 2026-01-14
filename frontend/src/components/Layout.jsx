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
			<div
				id="toast"
				className="fixed bottom-6 right-6 z-50 pointer-events-none opacity-0 translate-y-2 transition-all duration-200 max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2"
			>
				<div className="bg-slate-900 text-white text-sm px-4 py-3 rounded-2xl shadow-xl">
					<div id="toast-message">Action</div>
				</div>
			</div>
		</>
	);
};

export default Layout;
