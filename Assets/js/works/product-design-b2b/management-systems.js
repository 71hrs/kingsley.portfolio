requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-ready")));

const topButton = document.querySelector(".plms-top");

const updateTopButton = () => topButton?.classList.toggle("is-visible", window.scrollY > window.innerHeight);
window.addEventListener("scroll", updateTopButton, { passive: true });
updateTopButton();

topButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});
