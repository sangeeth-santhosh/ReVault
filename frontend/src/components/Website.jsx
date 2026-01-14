import { useEffect } from 'react';

const Website = () => {
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

			function updateExploreIndicator(activeBtn) {
				const section = document.getElementById('section-explore');
				const indicator = document.getElementById('explore-indicator');
				if (!section || !indicator || !activeBtn) return;

				const sectionRect = section.getBoundingClientRect();
				const btnRect = activeBtn.getBoundingClientRect();

				const fullW = btnRect.width;
				const w = Math.max(0, fullW / 3);
				const x = (btnRect.left - sectionRect.left) + ((fullW - w) / 2);

				indicator.style.width = `${w}px`;
				indicator.style.transform = `translateX(${x}px)`;
			}

			function bindExploreTabs() {
				const section = document.getElementById('section-explore');
				if (!section) return;

				const group = section.querySelector('div.justify-self-center div.flex');
				if (!group) return;

				const buttons = Array.from(group.querySelectorAll('button'));
				const setExploreActiveButton = (activeBtn) => {
					buttons.forEach((btn) => {
						const isActive = btn === activeBtn;
						btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
						btn.classList.toggle('bg-white', isActive);
						btn.classList.toggle('rounded-xl', isActive);
						btn.classList.toggle('shadow-sm', isActive);
						btn.classList.toggle('text-black', isActive);
						btn.classList.toggle('text-[#979797]', !isActive);

						const svg = btn.querySelector('svg');
						if (svg) {
							svg.classList.toggle('text-black', isActive);
							svg.classList.toggle('text-[#979797]', !isActive);
						}
					});
				};
				const initial = buttons.find((b) => b.classList.contains('bg-white')) || buttons[0];
				if (initial) {
					buttons.forEach((btn) => {
						btn.dataset.exploreSelected = btn === initial ? '1' : '0';
					});
					setExploreActiveButton(initial);
					updateExploreIndicator(initial);
				}

				buttons.forEach((b) => {
					bindOnce(b, () => {
						b.addEventListener('click', () => {
							buttons.forEach((btn) => {
								btn.dataset.exploreSelected = btn === b ? '1' : '0';
							});
							setExploreActiveButton(b);
							updateExploreIndicator(b);
						});
					});
				});

				window.addEventListener('resize', () => {
					// Re-align on resize based on last clicked button (or default active).
					const last = buttons.find((btn) => btn.dataset.exploreSelected === '1');
					const fallback = initial;
					updateExploreIndicator(last || fallback);
				});
			}

			function toggleFavorite(btn) {
				const svg = btn.querySelector('svg');
				if (!svg) return;
				const isOn = btn.dataset.favorited === '1';
				const next = !isOn;
				btn.dataset.favorited = next ? '1' : '0';
				btn.setAttribute('aria-pressed', next ? 'true' : 'false');

				svg.setAttribute('stroke', 'currentColor');
				svg.classList.add('text-black');
				if (next) {
					svg.classList.remove('text-black');
					svg.classList.add('text-red-500');
					svg.setAttribute('fill', 'currentColor');
				} else {
					svg.classList.remove('text-red-500');
					svg.classList.add('text-black');
					svg.setAttribute('fill', 'none');
				}
			}

			function bindProductFavorites() {
				document.querySelectorAll('button svg path[d*="M4.318 6.318"]').forEach((path) => {
					const btn = path.closest('button');
					if (!btn) return;
					bindOnce(btn, () => {
						btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Favorite');
						btn.addEventListener('click', () => {
							toggleFavorite(btn);
							showToast(btn.dataset.favorited === '1' ? 'Added to favorites (demo)' : 'Removed from favorites (demo)');
						});
					});
				});
			}

			function bindContextButtons() {
				const section = document.getElementById('section-explore');
				if (section) {
					const filtersBtn = Array.from(section.querySelectorAll('button')).find((b) =>
						(b.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() === 'filters'
					);
					if (filtersBtn) {
						bindOnce(filtersBtn, () => {
							filtersBtn.addEventListener('click', () => showToast('Filters opened (demo)'));
						});
					}

					const searchBtn = section.querySelector('button svg path[d*="M21 21l-6-6"]')?.closest('button');
					if (searchBtn) {
						bindOnce(searchBtn, () => {
							searchBtn.setAttribute('aria-label', searchBtn.getAttribute('aria-label') || 'Search');
							searchBtn.addEventListener('click', () => showToast('Search opened (demo)'));
						});
					}
				}

				const discountBtn = Array.from(document.querySelectorAll('button')).find((b) =>
					(b.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() === 'get discount'
				);
				if (discountBtn) {
					bindOnce(discountBtn, () => {
						discountBtn.addEventListener('click', () => showToast('Discount applied (demo)'));
					});
				}

				const openBtn = document.querySelector('button svg path[d*="M14 5l7 7"]')?.closest('button');
				if (openBtn) {
					bindOnce(openBtn, () => {
						openBtn.setAttribute('aria-label', openBtn.getAttribute('aria-label') || 'Open');
						openBtn.addEventListener('click', () => {
							const target = document.getElementById('section-inspiration');
							if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
							showToast('Opened (demo)');
						});
					});
				}
			}

			bindExploreTabs();
			bindProductFavorites();
			bindContextButtons();
		})();
	}, []);

	return (
		<>
			<div
				id="section-explore"
				className="relative grid grid-cols-[1fr_auto_1fr] items-center mb-6 border-b border-gray-300 -mx-6 px-6 py-6 max-md:grid-cols-1 max-md:gap-4 max-md:py-4 max-sm:-mx-4 max-sm:px-4"
			>
				<h2 className="text-3xl font-semibold justify-self-start">Explore</h2>
				<div className="relative z-10 justify-self-center -translate-x-[7.5rem] max-md:justify-self-start max-md:translate-x-0 max-md:w-full">
					<div className="flex bg-gray-100/50 p-1 rounded-xl relative max-sm:flex-wrap">
						<button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium">
							<svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16m-7 6h7"
								></path>
							</svg>
							demo1
						</button>
						<button className="flex items-center gap-2 px-4 py-2 text-[#979797] text-sm font-medium">
							<svg className="w-4 h-4 text-[#979797]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								></path>
							</svg>
							demo2
						</button>
						<button className="flex items-center gap-2 px-4 py-2 text-[#979797] text-sm font-medium">
							<svg className="w-4 h-4 text-[#979797]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								></path>
							</svg>
							demo3
						</button>
					</div>
				</div>
				<div className="justify-self-end flex items-center gap-2 max-md:justify-self-start max-md:w-full max-sm:flex-wrap">
					<button className="px-6 py-2 bg-gray-50 rounded-xl text-sm font-medium text-black relative">
						Filters
						<span className="absolute top-2 right-4 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
					</button>
					<button className="p-2 bg-gray-50 rounded-xl text-black">
						<svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							></path>
						</svg>
					</button>
				</div>
				<div
					id="explore-indicator"
					className="pointer-events-none absolute -bottom-px left-0 h-[3px] bg-blue-600 rounded-full transition-transform duration-200 ease-in-out will-change-transform"
				></div>
			</div>
			<div id="section-products" className="grid grid-cols-12 gap-6 max-md:grid-cols-1 max-md:gap-4">
				<div className="col-span-7 bg-[#c5e8d5] rounded-[32px] p-6 relative overflow-hidden h-48 flex items-center max-md:col-span-1">
					<div className="relative z-10">
						<h3 className="text-2xl font-semibold mb-4">GET UP TO 50% OFF</h3>
						<button className="px-6 py-2 bg-white/80 backdrop-blur rounded-full text-xs font-semibold">Get Discount</button>
					</div>
					<img
						src="https://csspicker.dev/api/image/?q=fashion+model+abstract&image_type=photo"
						className="absolute right-0 top-0 h-full w-2/3 object-cover mix-blend-multiply opacity-80"
					/>
				</div>
				<div className="col-span-2 row-span-2 bg-gray-50 rounded-[32px] p-6 flex flex-col relative max-md:col-span-1 max-md:row-span-1">
					<div className="flex gap-1 mb-4">
						<div className="w-3 h-3 rounded-full bg-pink-300"></div>
						<div className="w-3 h-3 rounded-full bg-yellow-300"></div>
					</div>
					<button className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
						<svg className="w-4 h-4 text-black" fill="none" stroke="#000000" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
							></path>
						</svg>
					</button>
					<img
						src="https://csspicker.dev/api/image/?q=pink+sandals&image_type=photo"
						className="w-full h-48 object-contain my-4"
					/>
					<div className="mt-auto">
						<p className="text-[10px] text-black font-semibold uppercase">Our Picks</p>
						<h4 className="text-sm font-semibold leading-tight">
							WMX Rubber
							<br></br>
							Zebra sandal
						</h4>
						<div className="mt-4 flex justify-end">
							<span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">$36</span>
						</div>
					</div>
				</div>
				<div className="col-span-3 row-span-2 bg-gray-50 rounded-[32px] p-6 flex flex-col relative max-md:col-span-1 max-md:row-span-1">
					<div className="flex gap-1 mb-4">
						<div className="w-3 h-3 rounded-full bg-yellow-200"></div>
						<div className="w-3 h-3 rounded-full bg-black"></div>
					</div>
					<button className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
						<svg className="w-4 h-4 text-black" fill="none" stroke="#000000" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
							></path>
						</svg>
					</button>
					<img
						src="https://csspicker.dev/api/image/?q=yellow+sneakers&image_type=photo"
						className="w-full h-48 object-contain my-4"
					/>
					<div className="mt-auto">
						<p className="text-[10px] text-black font-semibold uppercase">Your Choice</p>
						<h4 className="text-sm font-semibold leading-tight">
							Supper Skiny
							<br></br>
							jogger in brown
						</h4>
						<div className="mt-4 flex justify-end">
							<span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">$89</span>
						</div>
					</div>
				</div>
				<div
					id="section-inspiration"
					className="col-span-7 bg-[#fdf0b4] rounded-[32px] p-6 relative overflow-hidden h-48 flex items-center max-md:col-span-1"
				>
					<div className="relative z-10">
						<h3 className="text-3xl font-semibold mb-1 text-slate-900">Winter's weekend</h3>
						<p className="text-sm text-black">keep it casual</p>
					</div>
					<button className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
						<svg className="w-4 h-4" fill="none" stroke="#000000" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							></path>
						</svg>
					</button>
					<img
						src="https://csspicker.dev/api/image/?q=woman+fashion+portrait&image_type=photo"
						className="absolute right-0 bottom-0 h-[120%] w-1/2 object-cover object-top"
					/>
				</div>
			</div>
		</>
	);
};

export default Website;
