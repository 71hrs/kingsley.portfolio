document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  let isNavigatingAway = false;
  const playCaseEntry = () => {
    root.classList.add("case-entry-ready");
    root.classList.remove("case-entry-complete");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("case-entry-complete")));
  };
  if (document.documentElement.classList.contains("case-entry-ready")) {
    playCaseEntry();
  }
  window.addEventListener("pageshow", (event) => {
    isNavigatingAway = false;
    root.classList.remove("case-is-leaving");
    if (event.persisted) playCaseEntry();
  });
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
      const target = new URL(link.href, location.href);
      if (target.origin !== location.origin || (target.pathname === location.pathname && target.hash)) return;
      event.preventDefault();
      if (isNavigatingAway) return;
      isNavigatingAway = true;
      if (/\/(?:polyverse|dollar-flip)\.html$/.test(target.pathname)) {
        try { sessionStorage.setItem("portfolio-case-entry", target.pathname); } catch (_) {}
      }
      root.classList.add("case-is-leaving");
      try {
        if (!/\/(?:polyverse|dollar-flip)\.html$/.test(target.pathname)) {
          sessionStorage.setItem("portfolio-case-return", `${target.pathname}|${location.pathname}`);
        }
      } catch (_) {}
      window.setTimeout(() => { window.location.href = target.href; }, 500);
    });
  });
  const header = document.querySelector(".dfr-header");
  const backToTop = document.querySelector(".dfr-back-to-top");
  const menuToggle = document.querySelector(".dfr-menu-toggle");
  const navMenu = document.querySelector(".dfr-nav-menu");

  if (!header || !backToTop) return;

  const observer = new IntersectionObserver(
    ([entry]) => backToTop.classList.toggle("is-visible", !entry.isIntersecting),
    { threshold: 0 }
  );

  observer.observe(header);

  let contrastFrame = 0;
  const updateBackToTopContrast = () => {
    contrastFrame = 0;
    const rect = backToTop.getBoundingClientRect();
    const y = Math.min(window.innerHeight - 1, Math.max(0, rect.top + rect.height / 2));
    const documentY = window.scrollY + y;
    const introTransition = document.querySelector(".dfr-intro-media-transition");
    const lightStart = introTransition
      ? introTransition.offsetTop + introTransition.offsetHeight / 2
      : document.querySelector(".dfr-overview-details")?.offsetTop ?? 0;
    const impactTransition = document.querySelector(".dfr-impact-media-transition");
    const lightEnd = impactTransition
      ? impactTransition.offsetTop + impactTransition.offsetHeight / 2
      : document.body.scrollHeight;
    const lightSection = documentY >= lightStart && documentY < lightEnd;

    backToTop.classList.toggle("is-on-light", lightSection);
  };

  const requestContrastUpdate = () => {
    if (contrastFrame) return;
    contrastFrame = window.requestAnimationFrame(updateBackToTopContrast);
  };

  window.addEventListener("scroll", requestContrastUpdate, { passive: true });
  window.addEventListener("resize", requestContrastUpdate);
  updateBackToTopContrast();

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

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
