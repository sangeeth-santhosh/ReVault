import { useEffect } from 'react';
import { useSearchParams } from "react-router-dom";

const Explore = () => {
  const [, setSearchParams] = useSearchParams();
 
    useEffect(() => {
    (function () {
      function bindOnce(el, handler) {
        if (!el || el.dataset.bound === "1") return false;
        el.dataset.bound = "1";
        handler(el);
        return true;
      }

      function updateExploreIndicator(activeBtn) {
        const section = document.getElementById("section-explore");
        const indicator = document.getElementById("explore-indicator");
        if (!section || !indicator || !activeBtn) return;

        const sectionRect = section.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();

        const fullW = btnRect.width;
        const w = Math.max(0, fullW / 3);
        const x = btnRect.left - sectionRect.left + (fullW - w) / 2;

        indicator.style.width = `${w}px`;
        indicator.style.transform = `translateX(${x}px)`;
      }

      function bindExploreTabs() {
        const section = document.getElementById("section-explore");
        if (!section) return;

        const group = section.querySelector("div.justify-self-center div.flex");
        if (!group) return;

        const buttons = Array.from(group.querySelectorAll("button"));
        const setExploreActiveButton = (activeBtn) => {
          buttons.forEach((btn) => {
            const isActive = btn === activeBtn;
            btn.setAttribute("aria-pressed", isActive ? "true" : "false");
            btn.classList.toggle("bg-white", isActive);
            btn.classList.toggle("rounded-xl", isActive);
            btn.classList.toggle("shadow-sm", isActive);
            btn.classList.toggle("text-black", isActive);
            btn.classList.toggle("text-[#979797]", !isActive);

            const svg = btn.querySelector("svg");
            if (svg) {
              svg.classList.toggle("text-black", isActive);
              svg.classList.toggle("text-[#979797]", !isActive);
            }
          });
        };
        const initial =
          buttons.find((b) => b.classList.contains("bg-white")) || buttons[0];
        if (initial) {
          buttons.forEach((btn) => {
            btn.dataset.exploreSelected = btn === initial ? "1" : "0";
          });
          setExploreActiveButton(initial);
          updateExploreIndicator(initial);
        }

        buttons.forEach((b) => {
          bindOnce(b, () => {
            b.addEventListener("click", () => {
              buttons.forEach((btn) => {
                btn.dataset.exploreSelected = btn === b ? "1" : "0";
              });
              setExploreActiveButton(b);
              updateExploreIndicator(b);
            });
          });
        });

        window.addEventListener("resize", () => {
          // Re-align on resize based on last clicked button (or default active).
          const last = buttons.find(
            (btn) => btn.dataset.exploreSelected === "1"
          );
          const fallback = initial;
          updateExploreIndicator(last || fallback);
        });
      }

      function toggleFavorite(btn) {
        const svg = btn.querySelector("svg");
        if (!svg) return;
        const isOn = btn.dataset.favorited === "1";
        const next = !isOn;
        btn.dataset.favorited = next ? "1" : "0";
        btn.setAttribute("aria-pressed", next ? "true" : "false");

        svg.setAttribute("stroke", "currentColor");
        svg.classList.add("text-black");
        if (next) {
          svg.classList.remove("text-black");
          svg.classList.add("text-red-500");
          svg.setAttribute("fill", "currentColor");
        } else {
          svg.classList.remove("text-red-500");
          svg.classList.add("text-black");
          svg.setAttribute("fill", "none");
        }
      }

      function bindProductFavorites() {
        document
          .querySelectorAll('button svg path[d*="M4.318 6.318"]')
          .forEach((path) => {
            const btn = path.closest("button");
            if (!btn) return;
            bindOnce(btn, () => {
              btn.setAttribute(
                "aria-label",
                btn.getAttribute("aria-label") || "Favorite"
              );
              btn.addEventListener("click", () => {
                toggleFavorite(btn);
              });
            });
          });
      }

      function bindContextButtons() {
        const section = document.getElementById("section-explore");
        if (section) {
          const searchBtn = section
            .querySelector('button svg path[d*="M21 21l-6-6"]')
            ?.closest("button");
          if (searchBtn) {
            bindOnce(searchBtn, () => {
              searchBtn.setAttribute(
                "aria-label",
                searchBtn.getAttribute("aria-label") || "Search"
              );
            });
          }
        }

        const openBtn = document
          .querySelector('button svg path[d*="M14 5l7 7"]')
          ?.closest("button");
        if (openBtn) {
          bindOnce(openBtn, () => {
            openBtn.setAttribute(
              "aria-label",
              openBtn.getAttribute("aria-label") || "Open"
            );
            openBtn.addEventListener("click", () => {
              const target = document.getElementById("section-inspiration");
              if (target)
                target.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div
      id="section-explore"
      className="relative grid grid-cols-[1fr_auto_1fr] items-center mb-6 border-b border-gray-300 -mx-6 px-6 py-6 max-md:grid-cols-1 max-md:gap-4 max-md:py-4 max-sm:-mx-4 max-sm:px-4"
    >
      <h2 className="text-3xl font-semibold justify-self-start">Explore</h2>
      <div className="relative z-10 justify-self-center -translate-x-[7.5rem] max-md:justify-self-start max-md:translate-x-0 max-md:w-full">
        <div className="flex bg-gray-100/50 p-1 rounded-xl relative max-sm:flex-wrap">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium"
            type="button"
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("condition", "used");
                return next;
              });
            }}
          >
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
            Used
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-[#979797] text-sm font-medium"
            type="button"
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("condition", "unused");
                return next;
              });
            }}
          >
            <svg
              className="w-4 h-4 text-[#979797]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            Unused
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-[#979797] text-sm font-medium"
            type="button"
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("condition", "surplus");
                return next;
              });
            }}
          >
            <svg
              className="w-4 h-4 text-[#979797]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            Surplus
          </button>
        </div>
      </div>
      <div className="justify-self-end flex items-center gap-2 max-md:justify-self-start max-md:w-full max-sm:flex-wrap">
        <button className="px-6 py-2 bg-gray-100 rounded-xl text-sm font-medium text-black relative">
          Filters
          <span className=""></span>
        </button>
        <button className="p-2 bg-gray-100 rounded-xl text-black">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="#000000"
            viewBox="0 0 24 24"
          >
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
  );
};

export default Explore;
