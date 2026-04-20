// travel.js

document.addEventListener("DOMContentLoaded", () => {
  if (!Array.isArray(window.travelData)) {
    console.warn("travelData is missing or not an array.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("country");

  let entry = window.travelData.find((t) => t.id === requestedId);
  if (!entry && window.travelData.length > 0) entry = window.travelData[0];
  if (!entry) return;

  document.title = `Travel – ${entry.name} – Neo Monserrat`;

  const pageTitle = document.getElementById("travel-page-title");
  const subtitle = document.getElementById("travel-page-subtitle");
  const regionPill = document.getElementById("travel-region-pill");
  const descEl = document.getElementById("travel-destination-description");
  const bannerEl = document.getElementById("travel-banner");
  const carouselEl = document.getElementById("travel-carousel");
  const tripYearEl = document.getElementById("travel-year");
  const footerYearEl = document.getElementById("year");

  if (pageTitle) pageTitle.textContent = entry.name;

  if (subtitle) {
    subtitle.textContent =
      entry.hero || `Highlights and memories from my trip to ${entry.name}.`;
  }

  if (regionPill) {
    regionPill.textContent = entry.region || "Travel";
  }

  if (tripYearEl) {
    if (entry.year) {
      tripYearEl.textContent = `Year visited: ${entry.year}`;
    } else {
      tripYearEl.style.display = "none";
    }
  }

  if (descEl) {
    descEl.textContent = entry.description || "";
  }

  // Flags are now in assets/icons/flags/
  if (bannerEl && entry.flag) {
    bannerEl.style.backgroundImage = `url('assets/icons/flags/${entry.flag}')`;
  }

  // CDN-powered gallery
  if (carouselEl) {
    carouselEl.innerHTML = "";

    const images = Array.isArray(entry.images) ? entry.images : [];
    images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.decoding = "async";
      carouselEl.appendChild(img);
    });
  }

  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }
});
