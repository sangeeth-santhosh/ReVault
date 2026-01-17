import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import useAuth from '../hooks/useAuth.js';
import PaperPlane from '../components/PaperPlanej.jsx';

const Layout = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { token, loading } = useAuth();
	const tokenRef = useRef(null);
	const lastPublicRef = useRef('/');
	const lastPrivateRef = useRef('/dashboard');
	const toastTimerRef = useRef(null);
	const [apiLoadingCount, setApiLoadingCount] = useState(0);

	useEffect(() => {
		tokenRef.current = token;
	}, [token]);

	useEffect(() => {
		const handler = (e) => {
			const next = Number(e?.detail?.count);
			setApiLoadingCount(Number.isFinite(next) ? next : 0);
		};
		window.addEventListener('revault:loading', handler);
		return () => {
			window.removeEventListener('revault:loading', handler);
		};
	}, []);

	const showGlobalLoader = loading || apiLoadingCount > 0;

	const showToast = useCallback((message) => {
		const root = document.getElementById('toast');
		const msg = document.getElementById('toast-message');
		if (!root || !msg) return;
		msg.textContent = message || '';
		root.classList.remove('opacity-0');
		root.classList.remove('translate-y-2');
		root.classList.add('opacity-100');
		root.classList.add('translate-y-0');
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => {
			root.classList.remove('opacity-100');
			root.classList.remove('translate-y-0');
			root.classList.add('opacity-0');
			root.classList.add('translate-y-2');
		}, 2000);
	}, []);

	useEffect(() => {
		const handler = (e) => {
			const message = e?.detail?.message;
			showToast(message);
		};
		window.addEventListener('revault:toast', handler);
		return () => {
			window.removeEventListener('revault:toast', handler);
		};
	}, [showToast]);

	useEffect(() => {
		const { pathname, search, hash } = location;
		const fullPath = `${pathname}${search || ''}${hash || ''}`;

		const isPrivate =
			pathname === '/dashboard' ||
			pathname.startsWith('/inventory') ||
			pathname.startsWith('/requests') ||
			pathname.startsWith('/chats') ||
			pathname.startsWith('/transactions') ||
			pathname.startsWith('/reports') ||
			pathname.startsWith('/settings');

		if (isPrivate) {
			lastPrivateRef.current = fullPath;
		} else {
			lastPublicRef.current = fullPath;
		}

		const headerToggle = document.querySelector('header div.fixed button')?.closest('div');
		if (!headerToggle) return;
		const buttons = Array.from(headerToggle.querySelectorAll('button'));
		const dashboardBtn = buttons.find((b) => (b.textContent || '').trim().toLowerCase() === 'dashboard');
		const websiteBtn = buttons.find((b) => (b.textContent || '').trim().toLowerCase() === 'website');

		const setHeaderMode = (selectedBtn) => {
			const container = selectedBtn?.closest('div');
			if (!container) return;
			const btns = Array.from(container.querySelectorAll('button'));
			btns.forEach((b) => {
				const active = b === selectedBtn;
				b.classList.toggle('bg-white', active);
				b.classList.toggle('shadow-sm', active);
				b.classList.toggle('text-black', active);
				b.classList.toggle('text-[#979797]', !active);
				b.classList.toggle('rounded-full', true);
				b.setAttribute('aria-pressed', active ? 'true' : 'false');
			});
		};

		if (isPrivate && dashboardBtn) setHeaderMode(dashboardBtn);
		if (!isPrivate && websiteBtn) setHeaderMode(websiteBtn);
	}, [location]);

	useEffect(() => {
		const headerToggle = document.querySelector('header div.fixed button')?.closest('div');
		if (!headerToggle) return;
		const buttons = Array.from(headerToggle.querySelectorAll('button'));
		const dashboardBtn = buttons.find((b) => (b.textContent || '').trim().toLowerCase() === 'dashboard');
		const websiteBtn = buttons.find((b) => (b.textContent || '').trim().toLowerCase() === 'website');

		const bind = (btn, onClick) => {
			if (!btn || btn.dataset.routerBound === '1') return;
			btn.dataset.routerBound = '1';
			btn.addEventListener('click', onClick);
		};

		bind(dashboardBtn, () => {
			if (!tokenRef.current) {
				showToast('Please log in to access this feature');
				return;
			}
			navigate('/dashboard', { replace: false });
		});
		bind(websiteBtn, () => {
			navigate('/', { replace: false });
		});
	}, [navigate, showToast]);

	return (
		<>
			<div className="font-sans text-slate-800 h-screen">
				<div className="w-full h-screen bg-white shadow-2xl flex overflow-hidden max-md:flex-col">
					<Sidebar />
					<main className="flex-1 p-6 min-h-0 max-sm:p-4 flex flex-col">
						<Header />
						<div className="flex-1 min-h-0 overflow-y-auto relative">
							<Outlet />
							{showGlobalLoader ? (
								<div className="absolute inset-0 flex items-center justify-center">
									<PaperPlane className="" />
								</div>
							) : null}
						</div>
					</main>
				</div>
			</div>
			<div
				id="toast"
				className="fixed bottom-6 right-6 z-50 pointer-events-none opacity-0 translate-y-2 transition-all duration-200 max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2"
			>
				<div className="bg-slate-950/95 text-white text-sm px-4 py-3 rounded-2xl shadow-xl border border-white/10">
					<div id="toast-message">Action</div>
				</div>
			</div>
		</>
	);
};

export default Layout;
