import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Images from "../assets/Images.js";
import Explore from "./Explore.jsx";
import useAuth from "../hooks/useAuth.js";

const Header = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const displayName = useMemo(() => {
    if (!token) return "Login";
    const name = user?.name || user?.username || user?.email;
    if (!name) return "User";
    if (typeof name === "string" && name.includes("@")) return name.split("@")[0];
    return name;
  }, [token, user]);

  useEffect(() => {
    (function () {
      function bindOnce(el, handler) {
        if (!el || el.dataset.bound === "1") return false;
        el.dataset.bound = "1";
        handler(el);
        return true;
      }

      function setHeaderMode(selectedBtn) {
        const container = selectedBtn?.closest("div");
        if (!container) return;
        const buttons = Array.from(container.querySelectorAll("button"));
        buttons.forEach((b) => {
          const isActive = b === selectedBtn;
          b.classList.toggle("bg-white", isActive);
          b.classList.toggle("shadow-sm", isActive);
          b.classList.toggle("text-black", isActive);
          b.classList.toggle("text-[#979797]", !isActive);
          b.classList.toggle("rounded-full", true);
          b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      }

      function bindHeaderToggle() {
        const headerToggle = document
          .querySelector("header div.fixed button")
          ?.closest("div");
        if (!headerToggle) return;
        const buttons = Array.from(headerToggle.querySelectorAll("button"));
        buttons.forEach((b) => {
          bindOnce(b, () => {
            b.addEventListener("click", () => {
              setHeaderMode(b);
            });
          });
        });
        const initial =
          buttons.find((b) => b.classList.contains("bg-white")) || buttons[0];
        if (initial) setHeaderMode(initial);
      }

      bindHeaderToggle();
    })();
  }, []);

  useEffect(() => {
    if (!token && open) setOpen(false);
  }, [token, open]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = 224;
      const gap = 12;
      const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
      const top = Math.min(window.innerHeight - 8, rect.bottom + gap);
      setMenuPos({ top, left });
    };

    updatePosition();

    const onPointerDown = (e) => {
      const t = e.target;
      if (menuRef.current && menuRef.current.contains(t)) return;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onAnyScroll = () => {
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", onAnyScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", onAnyScroll, true);
    };
  }, [open]);

  const onLoginOrUserClick = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 30 }}>
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
            <button className="px-6 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-black">
              Dashboard
            </button>
            <button className="px-6 py-2 text-[#979797] text-sm font-medium">
              Website
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
              <img
                src={Images.Spidi}
                className="w-10 h-10 rounded-full object-cover bg-pink-100"
              />
              <span
                ref={triggerRef}
                className="text-sm font-semibold cursor-pointer"
                onClick={onLoginOrUserClick}
              >
                {displayName}
              </span>
              {token && open
                ? createPortal(
                    <div
                      ref={menuRef}
                      className="w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex flex-col"
                      style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 60 }}
                      onClick={(e) => {
                        const btn = e.target?.closest?.('button[data-action-toast="Logged out (demo)"]');
                        if (!btn) return;
                        logout();
                        setOpen(false);
                      }}
                    >
                      <button
                        type="button"
                        data-action-toast="Logged out (demo)"
                        className="mt-auto flex items-center gap-3 px-4 py-3 text-black hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        <span className="text-sm font-medium">Log out</span>
                      </button>
                    </div>,
                    document.body
                  )
                : null}
            </div>
          </div>
        </header>
        <Explore />
      </div>
    </>
  );
};

export default Header;
