// js/about.js
// About page: footer year, lightbox, CDN galleries (main + thumbnail rail),
// auto-discover images prefix1..N with miss-streak stop, keyboard + swipe,
// travel region list (flags local).

let lightboxApi = null;

// -----------------------------
// Cloudinary CDN config
// -----------------------------
const CLOUD_NAME = "dcnwpgvj5";
const CDN_IMAGE_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

const cdnImg = (publicId, w = 1600) =>
  `${CDN_IMAGE_BASE}/q_auto,f_auto,c_limit,w_${w}/${publicId}`;

// -----------------------------
// Init
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  lightboxApi = setupLightbox();

  // Build all thumb galleries on the page (music/sports pages will have them)
  document.querySelectorAll(".thumb-gallery").forEach((el) => {
    initThumbGallery(el);
  });

  // Travel page only (safe: function early-returns if root missing)
  renderTravelRegions();
});

// --------------------------------------------------
// LIGHTBOX
// --------------------------------------------------
function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imgEl = document.getElementById("lightbox-img");
  if (!lightbox || !imgEl) return null;

  const closeBtn = lightbox.querySelector(".lightbox-close");

  const open = (src, altText = "") => {
    imgEl.src = src;
    imgEl.alt = altText;

    lightbox.classList.add("is-visible");
    lightbox.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    imgEl.src = "";
    imgEl.alt = "";

    lightbox.classList.remove("is-visible");
    lightbox.setAttribute("aria-hidden", "true");
  };

  // Click outside image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  // Close button
  closeBtn?.addEventListener("click", close);

  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-visible")) {
      close();
    }
  });

  return { open, close };
}

// --------------------------------------------------
// Helpers: safe image probing (prevents broken/filler)
// --------------------------------------------------
function probeImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;

    const done = (ok) => resolve(ok);
    img.onload = () => done(true);
    img.onerror = () => done(false);

    // Hard timeout so it won't hang forever on slow/corrupt responses
    setTimeout(() => done(false), 3500);
  });
}

// --------------------------------------------------
// THUMB GALLERY (Main preview + thumbnail rail)
// Auto-discovers prefix1..N until miss-streak threshold
// --------------------------------------------------
async function initThumbGallery(root) {
  const prefix = (root.dataset.cdnPrefix || "").trim(); // e.g., music
  const max = Number(root.dataset.max || "80"); // safety cap
  const missLimit = Number(root.dataset.missLimit || "6"); // stop after N misses in a row

  if (!prefix) return;

  // Build DOM
  const top = document.createElement("div");
  top.className = "gallery-top";
  top.tabIndex = 0;

  const mainImg = document.createElement("img");
  mainImg.className = "gallery-main";
  mainImg.alt = `${prefix} preview`;

  const meta = document.createElement("div");
  meta.className = "gallery-meta";
  meta.textContent = `Loading…`;

  top.append(mainImg, meta);

  const rail = document.createElement("div");
  rail.className = "gallery-rail";

  root.append(top, rail);

  // Discover valid images (skip missing/corrupt; no filler)
  const items = [];
  let missStreak = 0;

  for (let i = 1; i <= max; i++) {
    const full = cdnImg(`${prefix}${i}`, 1600);
    const thumb = cdnImg(`${prefix}${i}`, 400);

    // eslint-disable-next-line no-await-in-loop
    const ok = await probeImage(thumb);

    if (ok) {
      items.push({ idx: i, src: full, thumb });
      missStreak = 0;
    } else {
      missStreak++;
      if (missStreak >= missLimit) break;
    }
  }

  if (items.length === 0) {
    meta.textContent = `No photos found`;
    return;
  }

  // Render thumbs
  items.forEach((u, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-thumb";
    btn.setAttribute("aria-label", `${prefix} ${u.idx}`);

    const img = new Image();
    img.src = u.thumb;
    img.alt = `${prefix} ${u.idx}`;
    img.loading = "lazy";
    img.decoding = "async";

    btn.appendChild(img);
    rail.appendChild(btn);

    btn.addEventListener("click", () => setActive(i, true));
  });

  // State
  let active = 0;

  const setActive = (index, scrollThumbIntoView = false) => {
    active = Math.max(0, Math.min(items.length - 1, index));
    const u = items[active];

    mainImg.src = u.src;
    mainImg.alt = `${prefix} ${u.idx}`;
    meta.textContent = `${active + 1} / ${items.length}`;

    rail.querySelectorAll(".gallery-thumb").forEach((t, idx) => {
      t.classList.toggle("is-active", idx === active);
    });

    if (scrollThumbIntoView) {
      const thumbEl = rail.children[active];
      thumbEl?.scrollIntoView?.({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // Init
  setActive(0, false);

  // Main click -> lightbox
  mainImg.addEventListener("click", () => {
    lightboxApi?.open?.(mainImg.src, mainImg.alt);
  });

  // Keyboard navigation
  top.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive(active + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive(active - 1, true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      lightboxApi?.open?.(mainImg.src, mainImg.alt);
    }
  });

  // Swipe on main (touch)
  let touchStartX = 0;
  top.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      touchStartX = t.clientX;
    },
    { passive: true }
  );

  top.addEventListener(
    "touchend",
    (e) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - touchStartX;
      if (Math.abs(dx) < 35) return;

      if (dx < 0) setActive(active + 1, true);
      else setActive(active - 1, true);
    },
    { passive: true }
  );

  // Mouse wheel vertical -> horizontal scroll on rail
  rail.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        rail.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

// --------------------------------------------------
// TRAVEL REGIONS LIST (flags local)
// --------------------------------------------------
function renderTravelRegions() {
  const root = document.getElementById("travel-regions-root");
  if (!root) return;

  if (typeof travelData === "undefined" || !Array.isArray(travelData)) return;

  const regionsMap = new Map();
  travelData.forEach((item) => {
    const regionName = item.region || "Other";
    if (!regionsMap.has(regionName)) regionsMap.set(regionName, []);
    regionsMap.get(regionName).push(item);
  });

  const REGION_ORDER = [
    "Southeast Asia",
    "East Asia",
    "Middle East",
    "North America",
    "Europe",
  ];

  const regionKeys = Array.from(regionsMap.keys());
  const orderedRegions = [
    ...REGION_ORDER.filter((r) => regionKeys.includes(r)),
    ...regionKeys.filter((r) => !REGION_ORDER.includes(r)).sort(),
  ];

  // Build a deploy-safe base URL for assets (works on GitHub Pages repo subpaths)
  const assetsBase = new URL("assets/", document.baseURI);

  orderedRegions.forEach((regionName) => {
    const destinations = regionsMap
      .get(regionName)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!destinations?.length) return;

    const groupEl = document.createElement("div");
    groupEl.className = "travel-region-group";

    const titleEl = document.createElement("h4");
    titleEl.className = "travel-region-title";
    titleEl.textContent = regionName;

    const listEl = document.createElement("div");
    listEl.className = "travel-country-select";

    destinations.forEach((dest) => {
      const row = document.createElement("a");
      row.className = "travel-select-row";
      row.href = `travel.html?country=${encodeURIComponent(dest.id)}`;

      const left = document.createElement("div");
      left.className = "travel-select-left";

      const flag = document.createElement("div");
      flag.className = "travel-flag-icon";

      if (dest.flag) {
        const flagUrl = new URL(`icons/flags/${dest.flag}`, assetsBase).href;
        flag.style.setProperty("--flag", `url('${flagUrl}')`);
      }

      const nameSpan = document.createElement("span");
      nameSpan.className = "travel-name";
      nameSpan.textContent = dest.name;

      const chevron = document.createElement("span");
      chevron.className = "travel-chevron";
      chevron.textContent = "›";

      left.append(flag, nameSpan);
      row.append(left, chevron);
      listEl.append(row);
    });

    groupEl.append(titleEl, listEl);
    root.append(groupEl);
  });
}

// --------------------------------------------------
// Gallery toggle button ("View gallery" / "Hide gallery")
// --------------------------------------------------
window.addEventListener("load", () => {
  document.querySelectorAll(".thumb-gallery").forEach((gallery) => {
    const top = gallery.querySelector(".gallery-top");
    const rail = gallery.querySelector(".gallery-rail");
    if (!top || !rail) return;

    let btn = top.querySelector(".gallery-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-toggle";
      btn.textContent = "View gallery";
      btn.setAttribute("aria-expanded", "false");
      top.appendChild(btn);
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = gallery.classList.toggle("rail-open");
      btn.textContent = isOpen ? "Hide gallery" : "View gallery";
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
});

// --------------------------------------------------
// ABOUT SUBNAV (multi-page)
// - Works even if subnav is injected AFTER load via includes.js
// --------------------------------------------------
(function initAboutSubnavActive() {
  const applyActive = () => {
    const links = Array.from(document.querySelectorAll(".about-subnav-link"));
    if (!links.length) return false;

    const currentFile =
      (window.location.pathname.split("/").pop() || "about.html").toLowerCase();

    links.forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();

      // remove hash/query, get filename only
      const targetFile = href.split("#")[0].split("?")[0].split("/").pop();

      a.classList.toggle("is-active", targetFile === currentFile);
    });

    return true;
  };

  // Try immediately
  if (applyActive()) return;

  // Retry for injected partials (fast + safe)
  let tries = 0;
  const tick = () => {
    tries++;
    if (applyActive()) return;
    if (tries < 80) requestAnimationFrame(tick); // ~1.3s max
  };
  requestAnimationFrame(tick);
})();
