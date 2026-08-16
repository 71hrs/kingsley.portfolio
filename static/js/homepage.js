const projects = {
  polyverse: {
    title: "Polyverse",
    pills: ["AI Consumer Product", "0→1 Product", "Contextual AI"],
    year: "2025",
    icon: "static/picture/homepage/polyverse-logo.svg",
    media: "static/picture/homepage/polyverse-preview.gif",
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
    media: "static/picture/homepage/dollar-flip-preview.gif",
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
    media: "static/picture/homepage/uircs-preview.png",
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

function closePreview() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("hpr-modal-open");
}

document.querySelectorAll("[data-project]").forEach((card) => card.addEventListener("click", () => {
  const data = projects[card.dataset.project];
  Object.entries(fields).forEach(([key, element]) => {
    if (key === "icon" || key === "media") element.src = data[key];
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
  fields.media.alt = `${data.title} project preview`;
  fields.icon.alt = "";
  modal.dataset.project = card.dataset.project;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("hpr-modal-open");
  closeButton.focus();
}));

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
  closeMenu();
  closePreview();
  document.body.classList.add("hpr-is-leaving");
  window.setTimeout(() => { window.location.href = destination; }, 420);
}

document.querySelectorAll(".hpr-page-link").forEach((link) => {
  link.addEventListener("click", navigateWithTransition);
});
fields.link.addEventListener("click", navigateWithTransition);

/* Browsers preserve body classes in the back-forward cache. Always restore the
   homepage to its neutral state when history navigation brings it back. */
window.addEventListener("pageshow", () => {
  document.body.classList.remove("hpr-is-leaving", "hpr-modal-open");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  closeMenu();
});
