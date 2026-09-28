import { setScrollLock } from "./scroll-lock.js";

const MOBILE_MAX_WIDTH = 768;

function isMobileViewport() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

export function initBurgerMenu() {
  const header = document.querySelector(".header");
  const burger = document.querySelector(".burger");
  const nav = document.querySelector("#site-nav");

  if (!header || !burger) {
    return;
  }

  const setMenuOpen = (open) => {
    header.classList.toggle("header--menu-open", open);
    burger.classList.toggle("burger--active", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    setScrollLock(open);
  };

  const closeMenu = () => setMenuOpen(false);

  burger.setAttribute("aria-expanded", "false");

  burger.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("header--menu-open"));
  });

  nav?.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobileViewport()) {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileViewport()) {
      closeMenu();
    }
  });
}
