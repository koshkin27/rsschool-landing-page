const storageKey = "theme";
const root = document.documentElement;
const toggle = document.querySelector(".theme-switch");

function applyTheme(theme) {
  root.dataset.theme = theme;

  if (toggle) {
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }
}

const saved = localStorage.getItem(storageKey);
const theme = saved === "dark" || saved === "light" ? saved : "light";
applyTheme(theme);

if (toggle) {
  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  });
}
