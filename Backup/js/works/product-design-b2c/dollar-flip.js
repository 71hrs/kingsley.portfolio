document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const revealPage = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("case-page-loading")));
  revealPage();
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    root.classList.add("case-page-loading");
    revealPage();
  });
  const header = document.querySelector(".dfr-header");
  const menuToggle = document.querySelector(".dfr-menu-toggle");
  const navMenu = document.querySelector(".dfr-nav-menu");


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
  const chapterHeaders = document.querySelectorAll(".dfr-chapter__header");
  const items = document.querySelectorAll(".dfr-subsection > h3, .dfr-body-copy, .dfr-case-media:not(.dfr-impact-evidence), .dfr-overview-details article, .dfr-reflection__copy > *");
  if ((!items.length && !chapterHeaders.length) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.body.classList.add("case-reveal-ready");
  chapterHeaders.forEach(item => { item.classList.add("case-reveal"); item.style.setProperty("--reveal-delay", "0ms"); });
  items.forEach(item => { item.classList.add("case-reveal"); item.style.setProperty("--reveal-delay", "70ms"); });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } }), { rootMargin: "0px 0px -8%", threshold: .04 });
  chapterHeaders.forEach(item => observer.observe(item));
  items.forEach(item => observer.observe(item));
});
