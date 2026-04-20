// js/includes.js
// Supports nested data-include (runs multiple passes until none remain).
// Also supports <meta data-include="partials/head.html" /> inside <head>.

async function injectOnce() {
  const nodes = Array.from(document.querySelectorAll("[data-include]"));
  if (nodes.length === 0) return 0;

  await Promise.all(
    nodes.map(async (el) => {
      const path = el.getAttribute("data-include");
      if (!path) return;

      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) {
        console.error("Include failed:", path, res.status);
        return;
      }

      const html = await res.text();

      // Special-case: <meta data-include="..."> inside <head>
      if (el.tagName === "META") {
        el.insertAdjacentHTML("beforebegin", html);
        el.remove();
        return;
      }

      // Normal case: replace the placeholder element with the included HTML
      el.outerHTML = html;
    })
  );

  return nodes.length;
}

async function injectAll(maxPasses = 10) {
  for (let i = 0; i < maxPasses; i++) {
    const count = await injectOnce();
    if (count === 0) break;
  }
}

// Run ASAP
injectAll();
