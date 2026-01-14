import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Images from "../assets/Images.js";
import Explore from "./Explore.jsx";

const Header = () => {
  const navigate = useNavigate();

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
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img
                src={Images.Spidi}
                className="w-10 h-10 rounded-full object-cover bg-pink-100"
              />
              <span className="text-sm font-semibold" onClick={() => navigate("/login")}>Login</span>
            </div>
          </div>
        </header>
        <Explore />
      </div>
    </>
  );
};

export default Header;
