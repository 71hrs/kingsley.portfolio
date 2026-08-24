// UIRCS uses the shared Dollar Flip case-study interaction model.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("case-entry-ready");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.add("case-entry-complete");
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".dfr-header");
  const menuToggle = document.querySelector(".dfr-menu-toggle");
  const navMenu = document.querySelector(".dfr-nav-menu");

  if (!header) return;

  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    navMenu?.classList.remove("is-open");
  };

  menuToggle?.addEventListener("click", () => {
    const opening = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(opening));
    navMenu?.classList.toggle("is-open", opening);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".dfr-header-actions")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

});

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".dfr-chapter__header, .dfr-subsection > h3, .dfr-body-copy, .dfr-case-media:not(.dfr-impact-evidence), .dfr-overview-details article, .dfr-reflection__copy > *");
  if (!items.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.body.classList.add("case-reveal-ready");
  items.forEach((item, index) => { item.classList.add("case-reveal"); item.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`); });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } }), { rootMargin: "0px 0px -10%", threshold: .08 });
  items.forEach(item => observer.observe(item));
});
