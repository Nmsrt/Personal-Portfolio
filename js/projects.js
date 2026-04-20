// js/projects.js
// Renders Academic + Personal into 2 carousels (1 card visible at a time)
// Arrow buttons use scrollIntoView() so snap always works.

document.addEventListener("DOMContentLoaded", () => {
  const projects = window.PROJECTS || [];

  const academicTrack = document.getElementById("academic-projects");
  const personalTrack = document.getElementById("personal-projects");

  const academicViewport = document.getElementById("academic-viewport");
  const personalViewport = document.getElementById("personal-viewport");

  const academicCount = document.getElementById("academic-count");
  const personalCount = document.getElementById("personal-count");

  function createCard(project) {
    const card = document.createElement("article");
    card.className = "card project-card";

    const thumb = project.thumbnail || project.media?.images?.[0]?.src || "";

    if (thumb) {
      const wrap = document.createElement("div");
      wrap.className = "project-card-thumb";

      const img = document.createElement("img");
      img.src = thumb;
      img.alt = `${project.title} preview`;
      img.loading = "lazy";

      wrap.appendChild(img);
      card.appendChild(wrap);
    }

    card.innerHTML += `
      <div class="card-tag">${project.tag || ""}</div>
      <h3 class="card-title">${project.title || ""}</h3>
      <p class="project-meta">${project.meta || ""}</p>
      <p class="card-text">${project.summary || ""}</p>
      <div class="project-card-actions">
        <a class="project-card-button" href="project.html?id=${encodeURIComponent(project.id)}">
          View details
        </a>
      </div>
    `;

    return card;
  }

  let aCount = 0;
  let pCount = 0;

  projects.forEach((project) => {
    if (project.category === "academic" && academicTrack) {
      academicTrack.appendChild(createCard(project));
      aCount += 1;
      return;
    }

    if (project.category === "personal" && personalTrack) {
      personalTrack.appendChild(createCard(project));
      pCount += 1;
    }
  });

  if (academicCount) academicCount.textContent = aCount ? String(aCount) : "";
  if (personalCount) personalCount.textContent = pCount ? String(pCount) : "";

  function getSlides(viewport) {
    const track = viewport?.querySelector(".carousel-track");
    return track ? Array.from(track.children) : [];
  }

  function getActiveIndex(viewport) {
    const slides = getSlides(viewport);
    if (!slides.length) return 0;

    const left = viewport.getBoundingClientRect().left;
    let bestIdx = 0;
    let bestDist = Infinity;

    slides.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.left - left);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });

    return bestIdx;
  }

  function scrollToIndex(viewport, idx) {
    const slides = getSlides(viewport);
    const target = slides[idx];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function updateButtons(panelEl, viewport) {
    const btnPrev = panelEl.querySelector('[data-action="prev"]');
    const btnNext = panelEl.querySelector('[data-action="next"]');

    const slides = getSlides(viewport);
    const total = slides.length;
    const idx = getActiveIndex(viewport);

    if (btnPrev) btnPrev.disabled = total <= 1 || idx <= 0;
    if (btnNext) btnNext.disabled = total <= 1 || idx >= total - 1;
  }

  function wireCarousel(panelSelector, viewport) {
    const panelEl = document.querySelector(panelSelector);
    if (!panelEl || !viewport) return;

    const btnPrev = panelEl.querySelector('[data-action="prev"]');
    const btnNext = panelEl.querySelector('[data-action="next"]');

    function onPrev() {
      const idx = getActiveIndex(viewport);
      scrollToIndex(viewport, Math.max(0, idx - 1));
    }

    function onNext() {
      const slides = getSlides(viewport);
      const idx = getActiveIndex(viewport);
      scrollToIndex(viewport, Math.min(slides.length - 1, idx + 1));
    }

    if (btnPrev) btnPrev.addEventListener("click", onPrev);
    if (btnNext) btnNext.addEventListener("click", onNext);

    viewport.addEventListener("scroll", () => updateButtons(panelEl, viewport), { passive: true });
    window.addEventListener("resize", () => updateButtons(panelEl, viewport));

    updateButtons(panelEl, viewport);
  }

  wireCarousel('[data-carousel="academic"]', academicViewport);
  wireCarousel('[data-carousel="personal"]', personalViewport);
});
