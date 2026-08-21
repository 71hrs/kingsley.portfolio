const projects = {
  polyverse: {
    title: "Polyverse",
    pills: ["AI Consumer Product", "0→1 Product", "Contextual AI"],
    year: "2025",
    icon: "static/picture/homepage/polyverse-logo.svg",
    media: "static/picture/homepage/polyverse-preview.webm",
    mediaType: "video",
    description: "Polyverse explores a new way of discovering cities through contextual AI, transforming personal signals such as time, location, and intent into meaningful experiences.",
    contribution: "Lead Product Designer",
    focus: "AI Product Strategy · Experience Design · Interaction Systems",
    link: "polyverse.html"
  },
  "dollar-flip": {
    title: "Dollar Flip",
    pills: ["AI Marketplace", "Decision Support", "0→1 Product"],
    year: "2024",
    icon: "static/picture/homepage/dollar-flip-logo.svg",
    media: "static/picture/homepage/dollar-flip-preview.webm",
    mediaType: "video",
    description: "Dollar Flip explores how AI can reduce uncertainty in secondhand transactions by helping sellers price confidently and buyers make informed decisions.",
    contribution: "Founding Product Designer",
    focus: "Marketplace Design · AI Decision Support · Product Strategy",
    link: "dollar-flip.html"
  },
  uircs: {
    title: "UIRCS",
    pills: ["Enterprise AI System", "Systems Design", "Complex Workflows"],
    year: "2025",
    icon: "static/picture/homepage/uircs-logo.svg",
    media: "static/picture/homepage/uircs-preview-20260817.png",
    mediaType: "image",
    description: "UIRCS explores how AI can transform fragmented infrastructure data into coordinated operational decisions across complex organizations.",
    contribution: "Product & Systems Designer",
    focus: "Enterprise Systems · AI Operations · Complex Workflows",
    link: "UIRCS.html"
  }
};

const modal = document.querySelector("#project-preview");
const closeButton = modal.querySelector(".hpr-modal__close");
const fields = {
  title: document.querySelector("#preview-title"),
  icon: document.querySelector("#preview-icon"), media: document.querySelector("#preview-media"),
  description: document.querySelector("#preview-description"),
  contribution: document.querySelector("#preview-contribution"), focus: document.querySelector("#preview-focus"), link: document.querySelector("#preview-link")
};

/* The modal reuses one media element. On a deployed site, a previous GIF can
   remain painted while the next asset is still travelling through the cache.
   Warm the selected project on intent and let only the latest click commit it. */
const mediaPreloads = new Map();
let previewRequest = 0;

function preloadMedia(source, mediaType = "image") {
  if (mediaPreloads.has(source)) return mediaPreloads.get(source);

  const pending = new Promise((resolve, reject) => {
    if (mediaType === "video") {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.onloadeddata = () => resolve(source);
      video.onerror = reject;
      video.src = source;
      return;
    }
    const image = new Image();
    image.onload = () => resolve(source);
    image.onerror = reject;
    image.src = source;
  });

  mediaPreloads.set(source, pending);
  return pending;
}

function ensurePreviewMedia(type) {
  const wantedTag = type === "video" ? "VIDEO" : "IMG";
  if (fields.media.tagName === wantedTag) return fields.media;
  const next = document.createElement(type === "video" ? "video" : "img");
  next.id = "preview-media";
  if (type === "video") {
    next.autoplay = true;
    next.muted = true;
    next.loop = true;
    next.playsInline = true;
  }
  fields.media.replaceWith(next);
  fields.media = next;
  return next;
}

function closePreview() {
  previewRequest += 1;
  modal.classList.remove("is-open");
  modal.classList.remove("is-media-ready");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("hpr-modal-open");
  fields.media.onload = null;
  if (fields.media.tagName === "VIDEO") fields.media.pause();
  fields.media.removeAttribute("src");
}

document.querySelectorAll("[data-project]").forEach((card) => {
  const warmSelectedMedia = () => {
    const project = projects[card.dataset.project];
    return preloadMedia(project.media, project.mediaType).catch(() => {});
  };
  card.addEventListener("pointerenter", warmSelectedMedia, { once: true });
  card.addEventListener("focusin", warmSelectedMedia, { once: true });

  card.addEventListener("click", () => {
    const data = projects[card.dataset.project];
    const request = ++previewRequest;

    modal.classList.remove("is-media-ready", "is-media-error");
    const media = ensurePreviewMedia(data.mediaType);
    media.onload = null;
    if (media.tagName === "VIDEO") media.pause();
    media.removeAttribute("src");

    Object.entries(fields).forEach(([key, element]) => {
      if (key === "icon") element.src = data[key];
      else if (key === "media") return;
      else if (key === "link") element.href = data[key];
      else element.textContent = data[key];
    });
    const pills = document.querySelector("#preview-pills");
    pills.replaceChildren(...data.pills.map((label) => {
      const pill = document.createElement("span");
      pill.textContent = label;
      return pill;
    }));
    fields.focus.textContent = data.focus;
    if (media.tagName === "IMG") media.alt = `${data.title} project preview`;
    else media.setAttribute("aria-label", `${data.title} project preview`);
    fields.icon.alt = "";
    modal.dataset.project = card.dataset.project;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("hpr-modal-open");
    closeButton.focus();

    preloadMedia(data.media, data.mediaType).then(() => {
      if (request !== previewRequest || !modal.classList.contains("is-open")) return;

      const revealMedia = () => {
        if (request !== previewRequest || media.getAttribute("src") !== data.media) return;
        modal.classList.add("is-media-ready");
      };

      if (media.tagName === "VIDEO") {
        media.onloadeddata = revealMedia;
        media.src = data.media;
        media.load();
        media.play().catch(() => {});
      } else {
        media.onload = revealMedia;
        media.src = data.media;
        if (media.complete && media.naturalWidth > 0) revealMedia();
      }
    }).catch(() => {
      if (request === previewRequest) modal.classList.add("is-media-error");
    });
  });
});

closeButton.addEventListener("click", closePreview);
modal.addEventListener("click", (event) => { if (event.target === modal) closePreview(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePreview(); });

const menuToggle = document.querySelector(".hpr-menu-toggle");
const navLinks = document.querySelector(".hpr-nav-links");

function closeMenu() {
  menuToggle?.setAttribute("aria-expanded", "false");
  navLinks?.classList.remove("is-open");
}

menuToggle?.addEventListener("click", () => {
  const opening = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(opening));
  navLinks.classList.toggle("is-open", opening);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

function navigateWithTransition(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const destination = event.currentTarget.href;
  if (!destination || document.body.classList.contains("hpr-is-leaving")) return;
  event.preventDefault();
  let isCaseTarget = false;
  let caseTone = "";
  try {
    const target = new URL(destination, window.location.href);
    if (target.pathname.endsWith("/polyverse.html") || target.pathname.endsWith("/dollar-flip.html")) {
      isCaseTarget = true;
      caseTone = target.pathname.endsWith("/dollar-flip.html") ? "case-transition--dollar" : "case-transition--polyverse";
      sessionStorage.setItem("portfolio-case-entry", target.pathname);
      sessionStorage.setItem("portfolio-case-return", `${location.pathname}|${target.pathname}`);
    }
  } catch (_) {}
  closeMenu();
  closePreview();
  document.body.classList.add("hpr-is-leaving");
  if (isCaseTarget) {
    document.documentElement.classList.add("case-transition-prepared", caseTone);
    requestAnimationFrame(() => document.documentElement.classList.add("case-transition-leaving"));
  }
  window.setTimeout(() => { window.location.href = destination; }, isCaseTarget ? 500 : 420);
}

document.querySelectorAll(".hpr-page-link").forEach((link) => {
  link.addEventListener("click", navigateWithTransition);
});
fields.link.addEventListener("click", navigateWithTransition);

/* Browsers preserve body classes in the back-forward cache. Always restore the
   homepage to its neutral state when history navigation brings it back. */
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

function clearStaleCaseTransition() {
  document.documentElement.classList.remove(
    "case-transition-prepared",
    "case-transition-leaving",
    "case-transition--polyverse",
    "case-transition--dollar"
  );
}

function restoreCaseNavigationState() {
  clearStaleCaseTransition();
  revealReturnedFromCase();
}

window.addEventListener("pageshow", () => {
  previewRequest += 1;
  document.body.classList.remove("hpr-is-leaving", "hpr-modal-open");
  modal.classList.remove("is-open", "is-media-ready", "is-media-error");
  modal.setAttribute("aria-hidden", "true");
  fields.media.onload = null;
  if (fields.media.tagName === "VIDEO") fields.media.pause();
  fields.media.removeAttribute("src");
  closeMenu();
  restoreCaseNavigationState();
});
requestAnimationFrame(restoreCaseNavigationState);
