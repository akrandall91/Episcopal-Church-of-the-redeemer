(() => {
  const config = window.REDEEMER_CONFIG || {};
  if (!config.analyticsEnabled || !config.googleSheetsWebAppUrl || navigator.doNotTrack === "1") return;

  const sessionKey = "redeemer_analytics_session";
  let sessionId = sessionStorage.getItem(sessionKey);
  const isNewSession = !sessionId;
  if (!sessionId) {
    sessionId = `${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
    sessionStorage.setItem(sessionKey, sessionId);
  }
  const startedAt = Date.now();
  const sentScroll = new Set();

  const send = (eventName, metadata = {}) => {
    const body = JSON.stringify({
      kind:"analytics",
      event_name:eventName,
      occurred_at:new Date().toISOString(),
      session_id:sessionId,
      page_path:location.pathname.split("/").pop() || "index.html",
      page_title:document.title,
      referrer_host:document.referrer ? new URL(document.referrer).hostname : "Direct",
      device:innerWidth < 680 ? "Mobile" : innerWidth < 1024 ? "Tablet" : "Desktop",
      metadata
    });
    fetch(config.googleSheetsWebAppUrl, {method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body}).catch(() => {});
  };

  send("page_view");
  if (isNewSession) send("session_start");
  addEventListener("redeemer:form-submitted", event => send("form_submit", {form_type:event.detail.formType}));
  document.addEventListener("focusin", event => {
    const form = event.target.closest?.("form[data-submission-form]");
    if (form && !form.dataset.analyticsStarted) {
      form.dataset.analyticsStarted = "true";
      send("form_start", {form_type:form.dataset.formType});
    }
  });
  document.addEventListener("click", event => {
    const link = event.target.closest?.("a");
    if (!link) return;
    const url = new URL(link.href, location.href);
    const label = link.textContent.trim().slice(0, 80);
    if (url.hostname !== location.hostname) send("outbound_click", {destination:url.hostname,label});
    if (link.matches("[data-square-link]")) send("giving_click", {provider:"Square"});
    if (/youtube\.com|youtu\.be/.test(url.hostname)) send("video_click", {label});
    if (/calendar\.google\.com/.test(url.hostname)) send("calendar_click", {label});
  });
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const percent = Math.round(scrollY / max * 100);
    [25,50,75,90].forEach(mark => {
      if (percent >= mark && !sentScroll.has(mark)) { sentScroll.add(mark); send("scroll_depth", {percent:mark}); }
    });
  }, {passive:true});
  addEventListener("pagehide", () => send("page_exit", {seconds:Math.round((Date.now()-startedAt)/1000)}));
})();
