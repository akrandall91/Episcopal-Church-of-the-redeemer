(() => {
  const config = window.REDEEMER_CONFIG || {};
  document.querySelectorAll("[data-square-link]").forEach(link => {
    if (!config.squareGivingUrl) return;
    link.href = config.squareGivingUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Continue to secure Square checkout";
    const card = link.closest("article");
    card?.querySelector(".eyebrow")?.replaceChildren("Secure online giving");
    card?.querySelector("h2 + p")?.replaceChildren("Continue to Redeemer’s secure Square checkout to make your gift.");
    card?.querySelector("[data-square-status]")?.remove();
  });
  document.querySelectorAll("[data-zelle-recipient]").forEach(el => {
    if (config.zelleRecipient) el.textContent = config.zelleRecipient;
  });
})();
