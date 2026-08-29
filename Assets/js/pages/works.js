(() => {
  document.documentElement.dataset.page = "works";

  const cards = document.querySelectorAll(".works-card");
  if (!cards.length) return;

  const setHovered = (card, hovered) => {
    card.classList.toggle("is-hovered", hovered);
    document.body.classList.toggle("works-has-hover", hovered);
  };

  cards.forEach((card) => {
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch") setHovered(card, true);
    });
    card.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "touch") setHovered(card, false);
    });
    card.addEventListener("focusin", () => setHovered(card, true));
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget)) setHovered(card, false);
    });
  });

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest(".works-card[href]") : null;
    if (!link || !link.getAttribute("href") || link.getAttribute("href") === "#" || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
    event.preventDefault();
    document.body.classList.add("site-is-leaving");
    window.setTimeout(() => { window.location.href = link.href; }, 420);
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("site-is-leaving", "works-has-hover");
    cards.forEach((card) => card.classList.remove("is-hovered"));
  });
})();
