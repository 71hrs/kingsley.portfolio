import "./MIT.js";

const projects = {
  polyverse: {
    title: "Polyverse",
    meta: "Lead Product Designer · 2025",
    icon: "static/MIT-picture/gallery-polyverse.png",
    media: "static/picture/polyverse-redesign/polyverse-ui-03.gif",
    description: "An AI-powered city exploration platform for moments when people want to go out but do not yet know what they want to do.",
    focus: "Open-ended exploration, contextual recommendations, and progressive refinement.",
    contribution: "Led product strategy, research, AI interaction design, prototyping, validation, and the design-system foundation.",
    link: "polyverse-redesign.html"
  },
  "dollar-flip": {
    title: "Dollar Flip",
    meta: "Founding Product Designer · 2024",
    icon: "static/MIT-picture/gallery-dollar-flip.png",
    media: "static/picture/dollar-flip/dollar-flip-buyer-experience.gif",
    description: "A second-hand marketplace designed to reduce uncertainty at critical buying and selling decisions.",
    focus: "AI-assisted pricing, guided buying, marketplace trust, and decision confidence.",
    contribution: "Led 0→1 product strategy and hands-on design from research and experimentation through scalable product foundations.",
    link: "dollar-flip.html"
  },
  uircs: {
    title: "UIRCS",
    meta: "Product & Systems Design · 2025",
    icon: "static/MIT-picture/gallery-UIRCS.png",
    media: "static/MIT-picture/UIRCS-UI-overview-dashboard.png",
    description: "A unified operational system for coordinating infrastructure risk across fragmented teams and information layers.",
    focus: "Systems thinking, operational workflows, information architecture, and cross-functional coordination.",
    contribution: "Mapped the structural problem and translated it into a coherent architecture, workflow, and interface system.",
    link: "UIRCS.html"
  }
};

const modal = document.querySelector("#project-preview");
const closeButton = modal.querySelector(".hpr-modal__close");
const fields = {
  title: document.querySelector("#preview-title"), meta: document.querySelector("#preview-meta"),
  icon: document.querySelector("#preview-icon"), media: document.querySelector("#preview-media"),
  description: document.querySelector("#preview-description"), focus: document.querySelector("#preview-focus"),
  contribution: document.querySelector("#preview-contribution"), link: document.querySelector("#preview-link")
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
