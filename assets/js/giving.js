(() => {
  const config = window.REDEEMER_CONFIG || {};
  document.querySelectorAll("[data-square-link]").forEach(link => {
    if (!config.squareGivingUrl) return;
    link.href = config.squareGivingUrl;
    link.textContent = "Continue to secure Square checkout";
    link.closest("article")?.querySelector("[data-square-status]")?.remove();
  });
  document.querySelectorAll("[data-zelle-recipient]").forEach(el => {
    if (config.zelleRecipient) el.textContent = config.zelleRecipient;
  });
})();
