import { useEffect } from 'react';
import Images from '../../assets/Images.js';

const DemoHeader = () => {
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

			function bindOnce(el, handler) {
				if (!el || el.dataset.bound === '1') return false;
				el.dataset.bound = '1';
				handler(el);
				return true;
			}

			function setHeaderMode(selectedBtn) {
				const container = selectedBtn?.closest('div');
				if (!container) return;
				const buttons = Array.from(container.querySelectorAll('button'));
				buttons.forEach((b) => {
					const isActive = b === selectedBtn;
					b.classList.toggle('bg-white', isActive);
					b.classList.toggle('shadow-sm', isActive);
					b.classList.toggle('text-black', isActive);
					b.classList.toggle('text-[#979797]', !isActive);
					b.classList.toggle('rounded-full', true);
					b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
				});
			}

			function bindHeaderToggle() {
				const headerToggle = document.querySelector('header div.fixed button')?.closest('div');
				if (!headerToggle) return;
				const buttons = Array.from(headerToggle.querySelectorAll('button'));
				buttons.forEach((b) => {
					bindOnce(b, () => {
						b.addEventListener('click', () => {
							setHeaderMode(b);
							const label = (b.textContent || '').trim();
							showToast(`${label} view (demo)`);
						});
					});
				});
				const initial = buttons.find((b) => b.classList.contains('bg-white')) || buttons[0];
				if (initial) setHeaderMode(initial);
			}

			bindHeaderToggle();
		})();
	}, []);

	return (
		<header className="relative flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-4">
			<div className="flex items-start gap-2">
				<span className="text-4xl font-semibold leading-none">37</span>
				<div className="h-4 w-px bg-gray-200 self-center"></div>
				<div className="leading-tight mt-[1px]">
					<div className="text-sm font-semibold text-black">Orders</div>
					<div className="text-xs text-gray-400">Last 7 days</div>
				</div>
			</div>
			<div className="fixed top-6 left-1/2 -translate-x-1/2 flex bg-gray-100/50 p-1.5 rounded-full z-20 max-md:static max-md:translate-x-0 max-md:mx-auto">
				<button className="px-6 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-black">Dashboard</button>
				<button className="px-6 py-2 text-[#979797] text-sm font-medium">Website</button>
			</div>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-3 pl-4 border-l border-gray-200">
					<img src={Images.Spidi} className="w-10 h-10 rounded-full object-cover bg-pink-100" />
					<span className="text-sm font-semibold">Sangeeth</span>
				</div>
			</div>
		</header>
	);
};

export default DemoHeader;
