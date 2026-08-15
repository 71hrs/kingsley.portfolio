document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".dfr-header");
  const backToTop = document.querySelector(".dfr-back-to-top");

  if (!header || !backToTop) return;

  const observer = new IntersectionObserver(
    ([entry]) => backToTop.classList.toggle("is-visible", !entry.isIntersecting),
    { threshold: 0 }
  );

  observer.observe(header);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
