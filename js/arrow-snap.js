(() => {
  const container = document.getElementById("snapContainer");
  if (!container) return;

  const getTarget = (a) => {
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#")) return null;
    return document.querySelector(href);
  };

  const scrollToEl = (el) => {
    if (!el) return;
    const y = el.offsetTop;
    container.scrollTo({ top: y, behavior: "smooth" });
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest(".scroll-arrow");
    if (!a) return;

    const target = getTarget(a);
    if (!target) return;

    e.preventDefault();
    scrollToEl(target);
  });
})();
