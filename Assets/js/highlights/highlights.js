const transitionLayer = document.createElement("div");
transitionLayer.className = "interior-page-transition";
transitionLayer.setAttribute("aria-hidden", "true");
document.body.append(transitionLayer);

const menuToggle = document.querySelector(".interior-menu-toggle");
const navLinks = document.querySelector(".interior-header .nav-links");
function closeMenu() {
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
  navLinks?.classList.remove("is-open");
}
menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  navLinks?.classList.toggle("is-open", open);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".interior-menu-toggle") && !event.target.closest(".interior-header .nav-links")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

function restoreHighlightsPage(event) {
  document.documentElement.classList.remove(
    "case-transition-prepared",
    "case-transition-leaving",
    "case-transition--polyverse",
    "case-transition--dollar"
  );
  if (event?.persisted) {
    document.body.classList.add("interior-page-loading");
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("interior-page-loading")));
  } else {
    document.body.classList.remove("interior-page-loading");
  }
  document.body.classList.remove("interior-is-leaving");
  closeMenu();
}

requestAnimationFrame(() => requestAnimationFrame(() => restoreHighlightsPage()));
window.addEventListener("pageshow", restoreHighlightsPage);

document.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || document.body.classList.contains("interior-is-leaving")) return;
    event.preventDefault();
    closeMenu();
    document.body.classList.add("interior-is-leaving");
    window.setTimeout(() => { window.location.href = link.href; }, 420);
  });
});
