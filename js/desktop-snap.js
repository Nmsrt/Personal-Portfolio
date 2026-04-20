(() => {
  const isDesktopSnap = () => window.matchMedia("(min-width: 431px)").matches;

  const initDesktopSnap = () => {
    const container = document.getElementById("snapContainer");
    if (!container) return false;

    // Pages are direct children with .snap-page
    const pages = Array.from(container.querySelectorAll(":scope > .snap-page"));
    if (pages.length < 2) return false;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const closestIndex = () => {
      const y = container.scrollTop;
      let best = 0, bestDist = Infinity;
      pages.forEach((el, i) => {
        const d = Math.abs(el.offsetTop - y);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };

    const isScrollableElement = (el) => {
      if (!el || el === document.body) return false;
      const cs = getComputedStyle(el);
      const canScrollY = /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
      return canScrollY || isScrollableElement(el.parentElement);
    };

    let locked = false;
    let wheelAcc = 0;

    const jumpTo = (i) => {
      locked = true;
      const idx = clamp(i, 0, pages.length - 1);
      container.scrollTo({ top: pages[idx].offsetTop, behavior: "smooth" });
      window.clearTimeout(jumpTo._t);
      jumpTo._t = window.setTimeout(() => (locked = false), 260);
    };

    const onWheel = (e) => {
      if (!isDesktopSnap()) return;

      // If user is scrolling inside an inner scroll area, don't hijack it
      if (isScrollableElement(e.target)) return;

      // If already animating, ignore
      if (locked) { e.preventDefault(); return; }

      // Accumulate small wheel deltas (trackpads)
      wheelAcc += e.deltaY;

      // Threshold: tune if needed
      const THRESH = 60;
      if (Math.abs(wheelAcc) < THRESH) {
        e.preventDefault();
        return;
      }

      const dir = wheelAcc > 0 ? 1 : -1;
      wheelAcc = 0;

      const current = closestIndex();
      jumpTo(current + dir);

      e.preventDefault();
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    // keep aligned after resize on desktop
    window.addEventListener("resize", () => {
      if (!isDesktopSnap()) return;
      jumpTo(closestIndex());
    });

    return true;
  };

  let tries = 0;
  const tick = () => {
    if (initDesktopSnap()) return;
    tries++;
    if (tries < 180) requestAnimationFrame(tick);
  };

  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(tick));
})();
