const projects = {
  polyverse: {
    title: "Polyverse",
    year: "2025",
    icon: "static/picture/homepage-polyverse-logo.svg",
    media: "static/picture/polyverse-redesign/polyverse-ui-03.gif",
    description: "Polyverse is an AI-powered city exploration platform for moments when people want to go out but do not yet know what they want to do. It translates context such as time, location, mood, and company into possibilities users can confidently evaluate and act on.",
    contribution: "Lead Product Designer",
    scope: "0→1 AI Exploration Experience",
    team: "Product design, engineering, and early beta users",
    link: "polyverse.html"
  },
  "dollar-flip": {
    title: "Dollar Flip",
    year: "2024",
    icon: "static/picture/homepage-dollar-flip-logo.svg",
    media: "static/picture/dollar-flip/dollar-flip-seller-experience.gif",
    description: "Dollar Flip is a secondhand marketplace designed to reduce uncertainty at the moments that most affect a transaction. AI-assisted pricing helps sellers make informed decisions, while guided buying helps buyers identify the information that matters before purchasing.",
    contribution: "Founding Product Designer",
    scope: "0→1 AI Marketplace Experience",
    team: "Product, engineering, AI, and business",
    link: "dollar-flip.html"
  },
  uircs: {
    title: "UIRCS",
    year: "2025",
    icon: "static/picture/homepage-uircs-logo.svg",
    media: "static/MIT-picture/UIRCS-UI-overview-dashboard.png",
    description: "UIRCS is an enterprise operations platform that brings fragmented infrastructure risk, ownership, and response workflows into one coordinated system. It gives teams a shared view of priorities, accountability, and the actions required to resolve emerging issues.",
    contribution: "Product & Systems Designer",
    scope: "Enterprise Risk Coordination System",
    team: "Domain experts, engineering, and operational users",
    link: "UIRCS.html"
  }
};

const modal = document.querySelector("#project-preview");
const closeButton = modal.querySelector(".hpr-modal__close");
const fields = {
  title: document.querySelector("#preview-title"), year: document.querySelector("#preview-year"),
  icon: document.querySelector("#preview-icon"), media: document.querySelector("#preview-media"),
  description: document.querySelector("#preview-description"),
  contribution: document.querySelector("#preview-contribution"), scope: document.querySelector("#preview-scope"),
  team: document.querySelector("#preview-team"), link: document.querySelector("#preview-link")
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
  fields.media.alt = `${data.title} project preview`;
  fields.icon.alt = "";
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

document.querySelectorAll(".hpr-page-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = link.href;
    if (!destination) return;
    event.preventDefault();
    closeMenu();
    document.body.classList.add("hpr-is-leaving");
    window.setTimeout(() => { window.location.href = destination; }, 420);
  });
});
