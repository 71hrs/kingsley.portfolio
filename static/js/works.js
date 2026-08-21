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

function restoreWorksPage(event) {
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

requestAnimationFrame(() => requestAnimationFrame(() => restoreWorksPage()));
window.addEventListener("pageshow", restoreWorksPage);

document.querySelectorAll('.navbar a, .ra-card[href]:not([target="_blank"])').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || document.body.classList.contains("interior-is-leaving")) return;
    event.preventDefault();
    let isCaseTarget = false;
    let caseTone = "";
    try {
      const target = new URL(link.href, window.location.href);
      if (target.pathname.endsWith("/polyverse.html") || target.pathname.endsWith("/dollar-flip.html")) {
        isCaseTarget = true;
        caseTone = target.pathname.endsWith("/dollar-flip.html") ? "case-transition--dollar" : "case-transition--polyverse";
        sessionStorage.setItem("portfolio-case-entry", target.pathname);
        sessionStorage.setItem("portfolio-case-return", `${location.pathname}|${target.pathname}`);
      }
    } catch (_) {}
    closeMenu();
    document.body.classList.add("interior-is-leaving");
    if (isCaseTarget) {
      document.documentElement.classList.add("case-transition-prepared", caseTone);
      requestAnimationFrame(() => document.documentElement.classList.add("case-transition-leaving"));
    }
    window.setTimeout(() => { window.location.href = link.href; }, isCaseTarget ? 500 : 420);
  });
});

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
requestAnimationFrame(revealReturnedFromCase);
