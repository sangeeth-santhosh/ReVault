import { useEffect } from 'react';

const DemoSidebar = () => {
	useEffect(() => {
		(function () {
			const toastEl = document.getElementById('toast');
			const toastMsgEl = document.getElementById('toast-message');

			let toastTimer = toastEl?.__demoToastTimer;

			function showToast(message) {
				if (!toastEl || !toastMsgEl) return;
				toastMsgEl.textContent = message;
				toastEl.classList.remove('pointer-events-none', 'opacity-0', 'translate-y-2');
				toastEl.classList.add('pointer-events-auto', 'opacity-100', 'translate-y-0');
				window.clearTimeout(toastTimer);
				toastTimer = window.setTimeout(hideToast, 2400);
				toastEl.__demoToastTimer = toastTimer;
			}

			function hideToast() {
				if (!toastEl) return;
				toastEl.classList.add('pointer-events-none', 'opacity-0', 'translate-y-2');
				toastEl.classList.remove('pointer-events-auto', 'opacity-100', 'translate-y-0');
			}
			const navLinks = Array.from(document.querySelectorAll('aside nav a[data-sidebar-nav]'));

			const ACTIVE = ['bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-200'];
			const INACTIVE = ['text-black', 'hover:bg-gray-50'];

			function setActive(link) {
				navLinks.forEach((a) => {
					a.classList.remove(...ACTIVE);
					a.classList.add(...INACTIVE);
					a.removeAttribute('aria-current');
				});

				link.classList.add(...ACTIVE);
				link.classList.remove(...INACTIVE);
				link.setAttribute('aria-current', 'page');
			}

			navLinks.forEach((a) => {
				a.addEventListener('click', (e) => {
					setActive(a);

					const href = a.getAttribute('href') || '';
					if (href.startsWith('#')) {
						const target = document.querySelector(href);
						if (target) {
							e.preventDefault();
							target.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}
					}
				});
			});

			document.querySelectorAll('[data-action-toast]').forEach((btn) => {
				btn.addEventListener('click', () => {
					const message = btn.getAttribute('data-action-toast') || 'Done';
					showToast(message);
				});
			});

			function bindOnce(el, handler) {
				if (!el || el.dataset.bound === '1') return false;
				el.dataset.bound = '1';
				handler(el);
				return true;
			}

			const seeAllBtn = Array.from(document.querySelectorAll('button')).find((b) =>
				(b.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() === 'see all'
			);
			if (seeAllBtn) {
				bindOnce(seeAllBtn, () => {
					seeAllBtn.addEventListener('click', () => {
						const target = document.getElementById('section-products');
						if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
						showToast('Showing all (demo)');
					});
				});
			}

			if (location.hash) {
				const match = navLinks.find((a) => a.getAttribute('href') === location.hash);
				if (match) setActive(match);
			}
		})();
	}, []);

	return (
		<aside className="w-60 border-r border-gray-200 p-6 flex flex-col max-md:w-full max-md:border-r-0 max-md:border-b max-md:p-4">
			<div className="relative mb-12 inline-block">
				<span className="text-2xl font-semibold tracking-tight text-slate-900">ReVoult</span>
				<div className="absolute -bottom-1 left-[42px] w-6 h-[3px] bg-blue-600 rounded-full"></div>
			</div>
			<nav className="space-y-1.5 flex-1">
				<a
					href="#section-products"
					data-sidebar-nav="Popular Products"
					className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-all"
				>
					<svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						></path>
					</svg>
					<span className="text-sm font-medium">demo</span>
				</a>
				<a
					href="#section-explore"
					data-sidebar-nav="Explore New"
					aria-current="page"
					className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 transition-all"
				>
					<svg className="w-5 h-5" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
					<span className="text-sm font-medium">demo</span>
				</a>
				<a
					href="#section-products"
					data-sidebar-nav="Clothing and Shoes"
					className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-all"
				>
					<svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
						></path>
					</svg>
					<span className="text-sm font-medium">demo</span>
				</a>
				<a
					href="#section-products"
					data-sidebar-nav="Gifts and Living"
					className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-all"
				>
					<svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
						></path>
					</svg>
					<span className="text-sm font-medium">demo</span>
				</a>
				<div className="py-4">
					<div className="h-px bg-gray-200 w-44 mx-auto"></div>
				</div>
				<div>
					<p className="px-4 text-[12px] font-semibold text-gray-500 tracking-widest mb-3">Quick actions</p>
					<button
						type="button"
						data-action-toast="Request sent (demo)"
						className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-gray-50 rounded-xl"
					>
						<span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
							<svg className="w-3.5 h-3.5" fill="none" stroke="#000000" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 5v14M5 12h14"
								></path>
							</svg>
						</span>
						demo
					</button>
					<button
						type="button"
						data-action-toast="Member invite opened (demo)"
						className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-gray-50 rounded-xl"
					>
						<span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
							<svg className="w-3.5 h-3.5" fill="none" stroke="#000000" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 5v14M5 12h14"
								></path>
							</svg>
						</span>
						demo
					</button>
				</div>
				<div className="py-4">
					<div className="h-px bg-gray-200 w-44 mx-auto"></div>
				</div>
				<div>
					<p className="px-4 text-[12px] font-semibold text-gray-500 tracking-widest mb-3">
						Last orders <span className="text-gray-800">37</span>
					</p>
					<div className="px-4 space-y-3">
						<div className="flex items-center gap-3">
							<img
								src="https://csspicker.dev/api/image/?q=sneaker+shoes&image_type=photo"
								className="w-8 h-8 rounded-lg object-cover bg-gray-100"
							/>
							<span className="text-xs text-black">
								<span className="font-semibold text-gray-800">demo</span>…view order
							</span>
						</div>
						<div className="flex items-center gap-3">
							<img
								src="https://csspicker.dev/api/image/?q=jacket+fashion&image_type=photo"
								className="w-8 h-8 rounded-lg object-cover bg-gray-100"
							/>
							<span className="text-xs text-black">
								<span className="font-semibold text-gray-800">demo</span>…view order
							</span>
						</div>
						<button className="text-xs font-medium text-gray-500 hover:underline">See all</button>
					</div>
				</div>
			</nav>
		</aside>
	);
};

export default DemoSidebar;
