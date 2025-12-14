import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Home from '../pages/public/Home.jsx';
import BrowseItems from '../pages/public/BrowseItems.jsx';
import ItemDetails from '../pages/public/ItemDetails.jsx';
import Login from '../pages/public/Login.jsx';
import Register from '../pages/public/Register.jsx';
import Contact from '../pages/public/Contact.jsx';
import Dashboard from '../pages/private/Dashboard.jsx';
import AddInventory from '../pages/private/AddInventory.jsx';
import MyInventory from '../pages/private/MyInventory.jsx';
import IncomingRequests from '../pages/private/IncomingRequests.jsx';
import MyRequests from '../pages/private/MyRequests.jsx';
import Chats from '../pages/private/Chats.jsx';
import Transactions from '../pages/private/Transactions.jsx';
import Reports from '../pages/private/Reports.jsx';
import Settings from '../pages/private/Settings.jsx';
import useAuth from '../hooks/useAuth.js';

const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return <div className="flex h-screen items-center justify-center">Loading...</div>;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

const AppRouter = () => (
	<Routes>
		<Route element={<PublicLayout />}>
			<Route index element={<Home />} />
			<Route path="browse" element={<BrowseItems />} />
			<Route path="items/:id" element={<ItemDetails />} />
			<Route path="login" element={<Login />} />
			<Route path="register" element={<Register />} />
			<Route path="contact" element={<Contact />} />
		</Route>

		<Route
			element={(
				<ProtectedRoute>
					<DashboardLayout />
				</ProtectedRoute>
			)}
		>
			<Route path="dashboard" element={<Dashboard />} />
			<Route path="inventory/add" element={<AddInventory />} />
			<Route path="inventory/my" element={<MyInventory />} />
			<Route path="requests/incoming" element={<IncomingRequests />} />
			<Route path="requests/my" element={<MyRequests />} />
			<Route path="chats" element={<Chats />} />
			<Route path="transactions" element={<Transactions />} />
			<Route path="reports" element={<Reports />} />
			<Route path="settings" element={<Settings />} />
		</Route>

		<Route path="*" element={<Navigate to="/" replace />} />
	</Routes>
);

export default AppRouter;
