document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".pvr-header");
  const backToTop = document.querySelector(".pvr-back-to-top");
  const menuToggle = document.querySelector(".pvr-menu-toggle");
  const navMenu = document.querySelector(".pvr-nav-menu");

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
    const introTransition = document.querySelector(".pvr-intro-media-transition");
    const lightStart = introTransition
      ? introTransition.offsetTop + introTransition.offsetHeight / 2
      : document.querySelector(".pvr-overview-details")?.offsetTop ?? 0;
    const impactTransition = document.querySelector(".pvr-impact-media-transition");
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

  const closeMenu = () => { menuToggle?.setAttribute("aria-expanded", "false"); navMenu?.classList.remove("is-open"); };
  menuToggle?.addEventListener("click", () => { const opening = menuToggle.getAttribute("aria-expanded") !== "true"; menuToggle.setAttribute("aria-expanded", String(opening)); navMenu?.classList.toggle("is-open", opening); });
  document.addEventListener("click", event => { if (!event.target.closest(".pvr-header-actions")) closeMenu(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
