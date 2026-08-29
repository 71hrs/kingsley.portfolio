(() => {
  const body = document.body;
  if (!body) return;
  body.classList.add("portfolio-redesign");

  const projectData = {
    "valentino-beauty": { region:"China", year:"2021", details:["Digital Designer", "China Social Campaign", "Cross-functional Team"] },
    "chem-guard": { region:"China", year:"2023", details:["Product & Industrial Designer", "Speculative Product System", "Cross-functional Team"] },
    "organisms-utopia": { region:"United States", year:"2024", details:["Interaction & Industrial Designer", "Speculative Ecosystem", "Cross-disciplinary Team"] },
    "the-underground-palace": { region:"United States", year:"2021", details:["Experience Designer", "Immersive Installation", "Cross-disciplinary Team"] },
    wave: { region:"United States", year:"2021", details:["Interaction Designer", "Physical–Digital Prototype", "Collaborative Team"] },
    glamhub: { region:"China", year:"2021", details:["Product Designer", "0 → 1 Service Experience", "Cross-functional Team"] }
  };

  const key = Object.keys(projectData).find((name) => body.classList.contains(name));
  const navbar = document.querySelector(".navbar");
  const logo = navbar?.querySelector(".logo");
  if (logo && !logo.querySelector("a")) {
    logo.innerHTML = '<a href="../../index.html" aria-label="Yuhui Qi home"><span class="site-brand-logo" aria-hidden="true"></span></a>';
  }

  const back = navbar?.querySelector(".nav-links a");
  if (back) {
    back.removeAttribute("onclick");
    back.href = "../../works.html";
    back.textContent = "Back to gallery";
  }

  /* Keep every redesigned case-study title inside the fixed header, then
     align it to the shared 580px copy column. */
  let sharedProjectName = document.querySelector(".legacy-project-name");
  const originalTitleSection = document.querySelector(".project-title-section");
  const originalProjectName = originalTitleSection?.querySelector(".project-title-text")?.textContent?.trim();
  if (navbar && originalProjectName && !sharedProjectName) {
    sharedProjectName = document.createElement("div");
    sharedProjectName.className = "legacy-project-name";
    sharedProjectName.innerHTML = `<span>${originalProjectName}</span>`;
    navbar.append(sharedProjectName);
  }
  if (originalTitleSection) originalTitleSection.hidden = true;

  const captionSection = document.querySelector(".project-caption-section");
  if (captionSection && key) {
    const { region, year } = projectData[key];
    captionSection.innerHTML = `<div class="project-caption-left"><span class="project-caption">${region}</span></div><div class="project-caption-right"><span class="project-caption">${year}</span></div>`;
  }

  if (navbar && !navbar.querySelector(".legacy-menu-toggle")) {
    const button = document.createElement("button");
    button.className = "legacy-menu-toggle";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation");
    button.innerHTML = "<span></span><span></span><span></span>";
    const menu = document.createElement("nav");
    menu.className = "legacy-nav-menu";
    menu.setAttribute("aria-label", "Portfolio navigation");
    menu.innerHTML = '<a href="../../index.html">Home</a><a href="../../works.html">Works</a><a href="../../highlights.html">Highlights</a><a href="../../about.html">About</a>';
    navbar.append(button, menu);
    const closeMenu = () => { button.setAttribute("aria-expanded", "false"); menu.classList.remove("is-open"); };
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    });
    document.addEventListener("click", (event) => { if (!menu.contains(event.target) && event.target !== button) closeMenu(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  }

  const chapters = [...document.querySelectorAll(".project-content-chapter")];
  document.querySelectorAll(".case-grid").forEach((grid) => {
    if (grid.querySelector(".case-label-column, .case-body")) return;
    grid.classList.add("case-media-row");
    const mediaStage = grid.firstElementChild;
    if (mediaStage?.querySelector("img, video, iframe")) mediaStage.classList.add("case-media");
  });
  const chapterTitles = [...document.querySelectorAll(".project-content-chapter .project-title")];
  chapterTitles.forEach((title, chapterIndex) => {
    if (title.querySelector(".project-index")) return;
    const raw = title.textContent.trim();
    const match = raw.match(/^\/?\s*(\d{1,2})?\s*(.*)$/);
    if (!match) return;
    const index = match[1]
      ? `/ ${match[1].padStart(2, "0")}`
      : (/overview/i.test(raw) ? "/ 01" : "");
    const label = match[2] || raw;
    title.textContent = "";
    if (index) {
      const indexNode = document.createElement("span");
      indexNode.className = "project-index";
      indexNode.textContent = index;
      title.append(indexNode);
    }
    const labelNode = document.createElement("span");
    labelNode.className = "project-label";
    labelNode.textContent = label;
    title.append(labelNode);
  });
  const overview = chapters.find((chapter) => /overview/i.test(chapter.textContent || "")) || chapters[0];
  overview?.classList.add("redesign-overview");
  if (overview && key && !document.querySelector(".redesign-project-details")) {
    const [role, scope, team] = projectData[key].details;
    const details = document.createElement("section");
    details.className = "redesign-project-details";
    details.setAttribute("aria-label", "Project details");
    details.innerHTML = `<article><h3>Role</h3><strong>${role}</strong><p>Hands-on design ownership across the project.</p></article><article><h3>Scope</h3><strong>${scope}</strong><p>From exploration through final design direction.</p></article><article><h3>Team</h3><strong>${team}</strong><p>Collaboration across the disciplines required by the work.</p></article>`;
    overview.after(details);
  }

  const reflection = [...chapters].reverse().find((chapter) => /reflection|thoughts|conclusion/i.test(chapter.querySelector(".project-title")?.textContent || ""));
  reflection?.classList.add("redesign-reflection");

  const overviewImages = overview ? [...overview.querySelectorAll("img")] : [];
  const firstOverviewImage = overviewImages[0];
  const firstOverviewUnit = firstOverviewImage?.closest(".project-content-unit");
  const firstOverviewFrame = firstOverviewImage?.parentElement;
  if (firstOverviewUnit && firstOverviewFrame) {
    firstOverviewUnit.classList.add("redesign-intro-media-transition");
    firstOverviewFrame.classList.add("redesign-intro-frame");
  }

  const outcomeChapter = chapters.find((chapter) => /outcome|impact|effect/i.test(chapter.querySelector(".project-title")?.textContent || ""));
  if (outcomeChapter) {
    /*
     * A chapter can contain an image gallery followed by copy and a film.
     * The old implementation selected the last <img>, so the background
     * transition could be inserted halfway through a chapter.  Select the
     * final complete media unit instead, including video and iframe embeds.
     */
    const mediaUnits = [...outcomeChapter.querySelectorAll(".project-content-unit")]
      .filter((unit) => unit.querySelectorAll("img, video, iframe").length === 1);
    const unit = mediaUnits.at(-1);
    const frame = unit?.querySelector(":scope > div, :scope > figure");
    if (unit && frame) {
      unit.classList.add("redesign-impact-media-transition");
      frame.classList.add("redesign-impact-frame");
    }
  }

  const nextProjects = {
    "glamhub": "polyverse.html",
    "chem-guard": "polyverse.html",
    "valentino-beauty": "../product-design-b2c/polyverse.html",
    "organisms-utopia": "../product-design-b2c/polyverse.html",
    "the-underground-palace": "../product-design-b2c/polyverse.html",
    "wave": "../product-design-b2c/polyverse.html"
  };
  if (key && !document.querySelector(".redesign-next-case")) {
    const nextHref = nextProjects[key];
    const next = document.createElement("footer");
    next.className = "redesign-next-case";
    next.innerHTML = `<div class="redesign-next-case__inner"><p>Next case study</p><a href="${nextHref}">Polyverse <span aria-hidden="true">↗</span></a><aside class="redesign-next-case__meta"><span>From Polyverse</span><strong>The best city experiences help people notice more—not simply move faster.</strong></aside></div>`;
    const siteFooter = document.createElement("footer");
    siteFooter.className = "redesign-site-footer";
    siteFooter.innerHTML = '<div class="redesign-site-footer__inner"><a href="mailto:yuhui.qi@outlook.com">Contact Yuhui</a><span>Copyright © Yuhui Qi 2026</span></div>';
    body.append(next, siteFooter);
  }
})();
