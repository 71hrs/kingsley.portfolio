(() => {
  const neuralSection = document.querySelector("#neural-interface");

  if (!neuralSection || neuralSection.querySelector(".chem-guard-neural-pair-carousel")) {
    return;
  }

  const imageBlocks = [...neuralSection.querySelectorAll(":scope > .project-image-block")];
  const referenceCarousel = neuralSection.querySelector(".chem-guard-neural-carousel");
  const hintTemplate = referenceCarousel?.querySelector(".project-carousel__swipe-hint");
  const controlsTemplate = referenceCarousel?.querySelector(".project-carousel__controls");

  if (imageBlocks.length < 2 || !controlsTemplate) {
    return;
  }

  const carousel = document.createElement("div");
  carousel.className = "project-carousel project-carousel--media-only project-section-intro-gap chem-guard-neural-pair-carousel";
  carousel.setAttribute("data-project-carousel", "");
  carousel.setAttribute("data-project-carousel-visible", "1");
  carousel.setAttribute("data-reveal", "");
  carousel.setAttribute("aria-label", "Chem Guard neural interface proposal and EEG headset");

  const viewport = document.createElement("div");
  viewport.className = "project-carousel__viewport";

  const track = document.createElement("div");
  track.className = "project-carousel__track";

  const createSlide = (block) => {
    const image = block.querySelector("img")?.cloneNode(true);

    if (!image) {
      return null;
    }

    image.className = "project-carousel__media-visual";

    const slide = document.createElement("article");
    slide.className = "project-carousel__slide project-carousel__slide--media-only project-carousel__slide--contained";

    if (image.getAttribute("src")?.includes("chem-guard-eeg-headset")) {
      slide.classList.add("chem-guard-neural-headset-slide");
    }

    const media = document.createElement("div");
    media.className = "project-media-split__media";
    media.append(image);
    slide.append(media);

    return slide;
  };

  const slides = imageBlocks.slice(0, 2).map(createSlide);

  if (slides.some((slide) => !slide)) {
    return;
  }

  if (hintTemplate) {
    slides[0].classList.add("project-carousel__slide--hinted");
    slides[0].prepend(hintTemplate.cloneNode(true));
  }

  slides.forEach((slide) => track.append(slide));
  viewport.append(track);

  const controls = controlsTemplate.cloneNode(true);
  controls.querySelector("[data-project-carousel-prev]")?.setAttribute("aria-label", "Previous Chem Guard neural interface image");
  controls.querySelector("[data-project-carousel-next]")?.setAttribute("aria-label", "Next Chem Guard neural interface image");

  carousel.append(viewport, controls);
  imageBlocks[0].before(carousel);
  imageBlocks.slice(0, 2).forEach((block) => block.remove());
})();

(() => {
  const explorationSources = new Map([
    ["chem-guard-exploration-01.webp", "chem-guard-exploration-01-16x9.webp"],
    ["chem-guard-exploration-02.webp", "chem-guard-exploration-02-16x9.webp"],
  ]);

  document.querySelectorAll('img[src*="chem-guard-exploration-0"]').forEach((image) => {
    const sourceName = image.src.split("/").pop();
    const replacementName = explorationSources.get(sourceName);

    if (replacementName) {
      image.src = image.src.replace(sourceName, replacementName);
    }
  });
})();

(() => {
  const communicationSection = document.querySelector("#communication-design");

  if (!communicationSection || communicationSection.querySelector(".chem-guard-communication-carousel")) {
    return;
  }

  const phoneCarousel = communicationSection.querySelector(".project-carousel--ctm-journey");
  const sceneBlock = [...communicationSection.querySelectorAll(":scope > .project-image-block")].find((block) =>
    block.querySelector('img[src*="chem-guard-gas-mask-mockup.webp"]'),
  );
  const referenceCarousel = phoneCarousel || communicationSection.querySelector(".project-carousel");
  const hintTemplate = communicationSection.querySelector(".chem-guard-neural-carousel .project-carousel__swipe-hint");
  const controlsTemplate = referenceCarousel?.querySelector(".project-carousel__controls");

  if (!phoneCarousel || !sceneBlock || !controlsTemplate) {
    return;
  }

  const phoneImages = [...phoneCarousel.querySelectorAll(".project-carousel__media-visual")]
    .slice(0, 4)
    .map((image) => image.cloneNode(true));
  const sceneImage = sceneBlock.querySelector("img")?.cloneNode(true);

  if (phoneImages.length !== 4 || !sceneImage) {
    return;
  }

  const carousel = document.createElement("div");
  carousel.className = "project-carousel project-carousel--media-only project-feature-intro-gap chem-guard-communication-carousel";
  carousel.setAttribute("data-project-carousel", "");
  carousel.setAttribute("data-project-carousel-visible", "1");
  carousel.setAttribute("data-reveal", "");
  carousel.setAttribute("aria-label", "Chem Guard mobile interface and field scenario");

  const viewport = document.createElement("div");
  viewport.className = "project-carousel__viewport";

  const track = document.createElement("div");
  track.className = "project-carousel__track";

  const phoneSlide = document.createElement("article");
  phoneSlide.className = "project-carousel__slide project-carousel__slide--media-only project-carousel__slide--hinted chem-guard-phone-slide";

  if (hintTemplate) {
    phoneSlide.append(hintTemplate.cloneNode(true));
  }

  const phoneGroup = document.createElement("div");
  phoneGroup.className = "project-media-cluster chem-guard-phone-group";

  phoneImages.forEach((image) => {
    const frame = document.createElement("figure");
    frame.className = "project-media-frame";
    image.className = "project-media";
    frame.append(image);
    phoneGroup.append(frame);
  });

  phoneSlide.append(phoneGroup);

  const sceneSlide = document.createElement("article");
  sceneSlide.className = "project-carousel__slide project-carousel__slide--media-only chem-guard-scene-slide";
  sceneImage.className = "project-carousel__media-visual";

  const sceneMedia = document.createElement("div");
  sceneMedia.className = "project-media-split__media";
  sceneMedia.append(sceneImage);
  sceneSlide.append(sceneMedia);

  track.append(phoneSlide, sceneSlide);
  viewport.append(track);

  const controls = controlsTemplate.cloneNode(true);
  controls.querySelector("[data-project-carousel-prev]")?.setAttribute("aria-label", "Previous Chem Guard communication image");
  controls.querySelector("[data-project-carousel-next]")?.setAttribute("aria-label", "Next Chem Guard communication image");

  carousel.append(viewport, controls);
  phoneCarousel.replaceWith(carousel);
  sceneBlock.remove();
})();
