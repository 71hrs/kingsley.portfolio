(() => {
  const protectedMedia = "img, picture, video";

  // This deters casual saving. It cannot prevent screenshots or developer tools.
  document.addEventListener("contextmenu", (event) => {
    if (event.target instanceof Element && event.target.closest(protectedMedia)) {
      event.preventDefault();
    }
  }, { capture: true });

  document.addEventListener("dragstart", (event) => {
    if (event.target instanceof Element && event.target.closest(protectedMedia)) {
      event.preventDefault();
    }
  }, { capture: true });

  const prepareMedia = (root = document) => {
    root.querySelectorAll("img, video").forEach((media) => {
      media.draggable = false;
      if (media instanceof HTMLVideoElement) {
        media.controlsList.add("nodownload");
        media.disablePictureInPicture = true;
      }
    });
  };

  prepareMedia();
  new MutationObserver(() => prepareMedia()).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
