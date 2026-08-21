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
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const slides = [...carousel.querySelectorAll(".pvr-media-carousel__slide")];
    const dots = [...carousel.querySelectorAll(".pvr-media-carousel__dots button")];
    const viewport = carousel.querySelector(".pvr-media-carousel__viewport");
    if (slides.length < 2) return;

    let stage = carousel.querySelector(".pvr-media-carousel__stage");
    if (!stage && viewport) {
      stage = document.createElement("div");
      stage.className = "pvr-media-carousel__stage";
      viewport.before(stage);
      stage.append(viewport);
    }

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    viewport?.prepend(lastClone);
    viewport?.append(firstClone);

    let activeIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains("is-active")));
    let physicalIndex = activeIndex + 1;
    const moveTrack = (animate = true) => {
      if (!viewport) return;
      viewport.style.transition = animate ? "transform 500ms cubic-bezier(.22, 1, .36, 1)" : "none";
      viewport.style.transform = `translate3d(-${physicalIndex * 100}%, 0, 0)`;
    };
    const syncControls = () => {
      const label = carousel.querySelector("[data-carousel-chip]");
      if (label) label.textContent = slides[activeIndex].dataset.carouselTitle || label.textContent;
      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", String(isActive));
      });
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === activeIndex);
        slide.setAttribute("aria-hidden", String(index !== activeIndex));
      });
    };

    const showSlide = nextIndex => {
      const resolvedIndex = (nextIndex + slides.length) % slides.length;
      if (resolvedIndex === activeIndex) return;
      activeIndex = resolvedIndex;
      physicalIndex += nextIndex > activeIndex ? -1 : 1;
      /* Buttons advance in their pressed direction; direct dot jumps use the
         corresponding original slide inside the same track. */
      if (nextIndex >= 0 && nextIndex < slides.length) physicalIndex = nextIndex + 1;
      else if (nextIndex < 0) physicalIndex = 0;
      else if (nextIndex >= slides.length) physicalIndex = slides.length + 1;
      syncControls();
      moveTrack();
    };

    carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
    syncControls();
    moveTrack(false);
    viewport?.addEventListener("transitionend", event => {
      if (event.propertyName !== "transform") return;
      if (physicalIndex === 0) { physicalIndex = slides.length; moveTrack(false); }
      if (physicalIndex === slides.length + 1) { physicalIndex = 1; moveTrack(false); }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const chapterHeaders = document.querySelectorAll(".pvr-chapter__header");
  const items = document.querySelectorAll(".pvr-subsection > h3, .pvr-body-copy, .pvr-process-block, .pvr-case-media:not(.pvr-impact-evidence), .pvr-overview-details article, .pvr-reflection__copy > *");
  if ((!items.length && !chapterHeaders.length) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.body.classList.add("case-reveal-ready");
  chapterHeaders.forEach(item => { item.classList.add("case-reveal"); item.style.setProperty("--reveal-delay", "0ms"); });
  items.forEach(item => { item.classList.add("case-reveal"); item.style.setProperty("--reveal-delay", "70ms"); });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } }), { rootMargin: "0px 0px -8%", threshold: .04 });
  chapterHeaders.forEach(item => observer.observe(item));
  items.forEach(item => observer.observe(item));
});
