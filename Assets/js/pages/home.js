(() => {
  const projects = {
    polyverse: {
      title: "Polyverse",
      link: "/work/polyverse",
      pills: ["AI Consumer Product", "0→1 Product", "Contextual AI"],
      icon: "static/picture/home/polyverse-logo.svg",
      media: "static/picture/home/polyverse-preview.webm",
      type: "video",
      description: "Polyverse explores a new way of discovering cities through contextual AI, transforming personal signals such as time, location, and intent into meaningful experiences.",
      role: "Lead Product Designer",
      focus: "AI Product Strategy · Experience Design · Interaction Systems",
    },
    "dollar-flip": {
      title: "Dollar Flip",
      link: "/work/dollar-flip",
      pills: ["AI Marketplace", "Decision Support", "0→1 Product"],
      icon: "static/picture/home/dollar-flip-logo.svg",
      media: "static/picture/home/dollar-flip-preview.webm",
      type: "video",
      description: "Dollar Flip explores how AI can reduce uncertainty in secondhand transactions by helping sellers price confidently and buyers make informed decisions.",
      role: "Founding Product Designer",
      focus: "Marketplace Design · AI Decision Support · Product Strategy",
    },
    uircs: {
      title: "UIRCS",
      link: "/work/uircs",
      pills: ["Enterprise AI System", "Systems Design", "Complex Workflows"],
      icon: "static/picture/home/uircs-logo.svg",
      media: "static/picture/home/uircs-preview-20260817.webp",
      type: "image",
      description: "UIRCS explores how AI can transform fragmented infrastructure data into coordinated operational decisions across complex organizations.",
      role: "Product & Systems Designer",
      focus: "Enterprise Systems · AI Operations · Complex Workflows",
    },
  };

  const modal = document.querySelector("#project-preview");
  if (!modal) return;

  const closeButton = modal.querySelector(".home-preview__close");
  const previewLink = modal.querySelector("#preview-link");
  const title = document.querySelector("#preview-title");
  const icon = document.querySelector("#preview-icon");
  const description = document.querySelector("#preview-description");
  const role = document.querySelector("#preview-contribution");
  const focus = document.querySelector("#preview-focus");
  const pills = document.querySelector("#preview-pills");
  const mediaWrap = modal.querySelector(".home-preview__media");
  let request = 0;

  const close = () => {
    request += 1;
    modal.classList.remove("is-open", "is-media-ready");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("home-preview-open");
    mediaWrap.replaceChildren();
  };

  document.querySelectorAll("[data-project]").forEach((card) => {
    card.addEventListener("click", () => {
      const data = projects[card.dataset.project];
      if (!data) return;

      const token = ++request;
      title.textContent = data.title;
      icon.src = data.icon;
      description.textContent = data.description;
      role.textContent = data.role;
      focus.textContent = data.focus;
      previewLink.href = data.link;
      pills.replaceChildren(...data.pills.map((label) => {
        const item = document.createElement("span");
        item.textContent = label;
        return item;
      }));

      const media = document.createElement(data.type === "video" ? "video" : "img");
      if (data.type === "video") {
        media.autoplay = true;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.addEventListener("loadeddata", () => {
          if (token === request) modal.classList.add("is-media-ready");
        }, { once: true });
      } else {
        media.alt = `${data.title} project preview`;
        media.addEventListener("load", () => {
          if (token === request) modal.classList.add("is-media-ready");
        }, { once: true });
      }
      media.src = data.media;
      mediaWrap.replaceChildren(media);
      modal.dataset.project = card.dataset.project;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("home-preview-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("pageshow", close);
})();
