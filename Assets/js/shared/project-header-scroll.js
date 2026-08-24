document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("body > header");
  if (!header) return;

  const headerHeight = header.getBoundingClientRect().height;
  const spacer = document.createElement("div");
  spacer.className = "case-smart-header-spacer";
  spacer.setAttribute("aria-hidden", "true");
  spacer.style.height = `${headerHeight}px`;
  header.after(spacer);
  header.classList.add("case-smart-header");

  let lastY = Math.max(0, window.scrollY);
  let frame = 0;
  const revealThreshold = 2;

  const menuIsOpen = () => Boolean(header.querySelector('[aria-expanded="true"], .is-open'));
  const update = () => {
    frame = 0;
    const currentY = Math.max(0, window.scrollY);
    const delta = currentY - lastY;

    if (currentY <= 24 || menuIsOpen()) {
      header.classList.remove("is-scroll-hidden");
    } else if (delta > revealThreshold) {
      header.classList.add("is-scroll-hidden");
    } else if (delta < -revealThreshold) {
      header.classList.remove("is-scroll-hidden");
    }

    lastY = currentY;
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive:true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("resize", () => {
    spacer.style.height = `${header.getBoundingClientRect().height}px`;
  });
  header.addEventListener("focusin", () => header.classList.remove("is-scroll-hidden"));
  header.addEventListener("pointerenter", () => header.classList.remove("is-scroll-hidden"));
  update();
});
