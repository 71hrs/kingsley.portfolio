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

function restoreHighlightsPage(event) {
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

function revealReturnedFromCase() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const [destination, source] = (sessionStorage.getItem("portfolio-case-return") || "").split("|");
    if (destination !== location.pathname || !/\/(?:polyverse|dollar-flip)\.html$/.test(source)) return;
    sessionStorage.removeItem("portfolio-case-return");
    const tone = source.includes("dollar-flip") ? "case-return--dollar" : "case-return--polyverse";
    document.documentElement.classList.remove("case-return--dollar", "case-return--polyverse", "case-return-complete");
    document.documentElement.classList.add("case-return-ready", tone);
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("case-return-complete")));
    window.setTimeout(() => document.documentElement.classList.remove("case-return-ready", tone, "case-return-complete"), 700);
  } catch (_) {}
}
window.addEventListener("pageshow", revealReturnedFromCase);

document.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || document.body.classList.contains("interior-is-leaving")) return;
    event.preventDefault();
    closeMenu();
    document.body.classList.add("interior-is-leaving");
    window.setTimeout(() => { window.location.href = link.href; }, 420);
  });
});
