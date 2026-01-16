import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from '../layout/Layout.jsx';
import BrowseItems from '../pages/website/BrowseItems.jsx';
import ItemDetails from '../pages/website/ItemDetails.jsx';
import Login from '../pages/website/Login.jsx';
import Register from '../pages/website/Register.jsx';
import Dashboard from '../components/Dashboard.jsx';
import Website from '../components/Promo.jsx';
import AddInventory from '../pages/dashboard/AddInventory.jsx';
import MyInventory from '../pages/dashboard/MyInventory.jsx';
import IncomingRequests from '../pages/dashboard/IncomingRequests.jsx';
import MyRequests from '../pages/dashboard/MyRequests.jsx';
import Chats from '../pages/dashboard/Chats.jsx';
import Transactions from '../pages/dashboard/Transactions.jsx';
import Reports from '../pages/dashboard/Reports.jsx';
import Settings from '../pages/dashboard/Settings.jsx';
import useAuth from '../hooks/useAuth.js';
import PaperPlane from '../components/PaperPlanej.jsx';

const PublicShell = () => <Outlet />;

const PrivateShell = () => <Outlet />;

const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<PaperPlane className="w-16 h-16" />
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

const AppRouter = () => (
	<Routes>
		<Route path="/" element={<Layout />}>
			<Route element={<PublicShell />}>
				<Route index element={<BrowseItems />} />
				{/* <Route path="browse" element={<BrowseItems />} /> */}
				<Route path="items/:id" element={<ItemDetails />} />
				<Route path="login" element={<Login />} />
				<Route path="register" element={<Register />} />
				<Route path="demo" element={<Website />} />
			</Route>

			<Route
				element={(
					<ProtectedRoute>
						<PrivateShell />
					</ProtectedRoute>
				)}
			>
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="inventory/add" element={<AddInventory />} />
				<Route path="inventory/update/:id" element={<AddInventory />} />
				<Route path="inventory/my" element={<MyInventory />} />
				<Route path="requests/incoming" element={<IncomingRequests />} />
				<Route path="requests/my" element={<MyRequests />} />
				<Route path="chats" element={<Chats />} />
				<Route path="transactions" element={<Transactions />} />
				<Route path="reports" element={<Reports />} />
				<Route path="settings" element={<Settings />} />
			</Route>
		</Route>

		<Route path="*" element={<Navigate to="/" replace />} />
	</Routes>
);

export default AppRouter;
