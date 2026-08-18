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

  const vimeoCover = document.querySelector(".pvr-vimeo-cover");
  vimeoCover?.addEventListener("click", () => {
    const videoId = vimeoCover.dataset.vimeoId;
    if (!videoId || vimeoCover.dataset.playing === "true") return;
    vimeoCover.dataset.playing = "true";
    const frame = document.createElement("iframe");
    frame.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&badge=0&autopause=0&title=0&byline=0&portrait=0`;
    frame.title = "Polyverse product demo";
    frame.allow = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
    frame.allowFullscreen = true;
    vimeoCover.replaceWith(frame);
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".pvr-chapter__header, .pvr-subsection > h3, .pvr-body-copy, .pvr-process-block, .pvr-case-media:not(.pvr-impact-evidence), .pvr-overview-details article, .pvr-reflection__copy > *");
  if (!items.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.body.classList.add("case-reveal-ready");
  items.forEach((item, index) => { item.classList.add("case-reveal"); item.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`); });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } }), { rootMargin: "0px 0px -10%", threshold: .08 });
  items.forEach(item => observer.observe(item));
});
