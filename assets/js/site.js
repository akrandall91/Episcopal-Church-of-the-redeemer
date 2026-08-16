(() => {
  document.documentElement.classList.add("js");
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  const light = document.createElement("div");
  light.className = "cursor-light";
  light.setAttribute("aria-hidden", "true");
  document.body.appendChild(light);
  const config = window.REDEEMER_CONFIG || {};
  const onPages = location.protocol === "file:" ? "" : (location.pathname.includes("/Episcopal-Church-of-the-redeemer/") ? config.basePath : "/");
  const href = page => `${onPages}${page}`;
  const page = document.body.dataset.page || "";
  if (page === "history") document.querySelector(".legacy-home .giant-year")?.replaceChildren("1906");
  if (page === "about") {
    document.querySelector(".page-hero .shell > p:last-child")?.replaceChildren("Greensboro's historic Black Episcopal parish—worshipping, serving, and carrying faith forward since 1906.");
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Meet Episcopal Church of the Redeemer, Greensboro's historic African-American Episcopal parish, rooted in a mission vision established in 1906.");
  }
  if (!document.querySelector('link[rel="canonical"]') && location.protocol !== "file:") {
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = new URL(location.pathname, "https://akrandall91.github.io").href;
    document.head.appendChild(canonical);
  }
  const title = document.title;
  let descriptionMeta = document.querySelector('meta[name="description"]');
  if (!descriptionMeta) {
    descriptionMeta=document.createElement("meta");
    descriptionMeta.name="description";
    descriptionMeta.content="Episcopal Church of the Redeemer in Greensboro, North Carolina.";
    document.head.appendChild(descriptionMeta);
  }
  const description = descriptionMeta.content;
  [["og:title",title],["og:description",description],["og:type","website"]].forEach(([property,content]) => {
    if (document.querySelector(`meta[property="${property}"]`)) return;
    const meta=document.createElement("meta"); meta.setAttribute("property",property); meta.content=content; document.head.appendChild(meta);
  });
  if (!document.querySelector('meta[property="og:image"]')) {
    const meta=document.createElement("meta"); meta.setAttribute("property","og:image"); meta.content=href("assets/images/og-placeholder.svg"); document.head.appendChild(meta);
  }
  if (!document.querySelector('script[data-site-schema]')) {
    const schema=document.createElement("script"); schema.type="application/ld+json"; schema.dataset.siteSchema="";
    schema.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Church","name":"Episcopal Church of the Redeemer","description":"The only African-American Episcopal parish in Greensboro, North Carolina.","url":location.href,"telephone":"+1-336-275-0033","address":{"@type":"PostalAddress","streetAddress":"901 E Friendly Ave.","addressLocality":"Greensboro","addressRegion":"NC","postalCode":"27401-3103","addressCountry":"US"},"sameAs":["https://redeemerchurchgso.org/","https://www.facebook.com/EpiscopalRedeemergso/",config.youtubeChannelUrl]});
    document.head.appendChild(schema);
  }
  const links = [
    ["visit","Visit","visit.html"],["worship","Worship","worship.html"],["watch","Watch Live","watch-live.html"],
    ["ministries","Connect & Serve","ministries.html"],["history","Our Story","history.html"],
    ["calendar","Events","calendar.html"],["give","Give","give.html"],["contact","Contact","contact.html"]
  ];
  const header = document.querySelector("[data-site-header]");
  if (header) header.innerHTML = `<header class="site-header"><div class="shell"><a class="brand" href="${href("index.html")}"><img class="redeemer-main-logo" src="${href("assets/images/brand/redeemer-main-logo.png")}" alt="Episcopal Church of the Redeemer"><span><strong>Church of the Redeemer</strong><small>Greensboro · Est. 1909</small></span></a><button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button><nav class="nav" id="site-nav" aria-label="Primary">${links.map(([id,label,url])=>`<a ${page===id?'aria-current="page"':''} href="${href(url)}">${label}</a>`).join("")}<a class="nav-cta" href="${href("visit.html#visit-form")}">Plan a visit</a></nav></div></header>`;
  const footer = document.querySelector("[data-site-footer]");
  header?.querySelector(".brand small")?.replaceChildren("Greensboro · Est. 1906");
  if (footer) footer.innerHTML = `<footer class="site-footer"><div class="shell"><div class="footer-grid"><div><a class="brand" href="${href("index.html")}"><img class="brand-shield brand-shield-ko" src="${href("assets/images/logos/episcopal-shield-ko.png")}" alt=""><span><strong>Church of the Redeemer</strong><small>Greensboro · Est. 1909</small></span></a><p>A historic Black Episcopal parish. A church home for every generation.</p><p>901 E Friendly Ave<br>Greensboro, NC 27401<br><a href="tel:+13362750033">(336) 275-0033</a></p></div><div><h3>Welcome</h3><ul><li><a href="${href("visit.html")}">Plan Your Visit</a></li><li><a href="${href("getting-here.html")}">Getting Here</a></li><li><a href="${href("students-families.html")}">Students & Families</a></li><li><a href="${href("calendar.html")}">Calendar</a></li><li><a href="${href("share-a-memory.html")}">Share a Memory</a></li></ul></div><div><h3>Worship & care</h3><ul><li><a href="${href("watch-live.html")}">Watch Live</a></li><li><a href="${href("prayer-request.html")}">Prayer Request</a></li><li><a href="${href("pastoral-care.html")}">Pastoral Care</a></li><li><a href="${href("volunteer.html")}">Volunteer</a></li><li><a href="${href("give.html")}">Give</a></li></ul></div><div><h3>Stay connected</h3><p>Sunday Holy Eucharist at 10:00 AM.<br>Church School at 9:00 AM.</p><a class="button button-light" href="${href("newsletter.html")}">Join our newsletter</a><p><a href="https://www.facebook.com/EpiscopalRedeemergso/">Facebook</a> · <a href="${config.youtubeChannelUrl || "#"}">YouTube</a></p><img class="tec-footer-logo" src="${href("assets/images/logos/episcopal-church-horizontal-ko.png")}" alt="The Episcopal Church"></div></div><p class="episcopal-identity">A congregation of the Episcopal Diocese of North Carolina, The Episcopal Church, and the Anglican Communion.</p><div class="footer-bottom"><p>© 2026 Episcopal Church of the Redeemer</p><p><a href="${href("privacy.html")}">Privacy</a> · <a href="${href("member-updates.html")}">Member updates</a></p></div></div></footer>`;
  footer?.querySelector(".brand small")?.replaceChildren("Greensboro · Est. 1906");
  const welcomeLinks = footer?.querySelector(".footer-grid > div:nth-child(2) ul");
  if (welcomeLinks) {
    const item = document.createElement("li");
    item.innerHTML = `<a href="${href("intake.html")}">Forms & Requests</a>`;
    welcomeLinks.appendChild(item);
    const memberItem = document.createElement("li");
    memberItem.innerHTML = `<a href="${href("member-login.html")}">Member login</a>`;
    welcomeLinks.appendChild(memberItem);
  }
  const menu = document.querySelector(".menu-button");
  let mobileTrigger = null;
  if (matchMedia("(max-width: 980px)").matches) {
    mobileTrigger = document.createElement("button");
    mobileTrigger.type = "button";
    mobileTrigger.className = "mobile-menu-trigger";
    mobileTrigger.setAttribute("aria-expanded", "false");
    mobileTrigger.setAttribute("aria-controls", "site-nav");
    mobileTrigger.textContent = "Menu";
    document.body.appendChild(mobileTrigger);
  }
  const positionMobileMenu = () => {
    if (!menu) return;
    if (innerWidth <= 980) {
      menu.style.display="block";
      menu.style.position="fixed";
      menu.style.left="calc(100vw - 72px)";
      menu.style.right="auto";
      menu.style.top="23px";
      menu.style.zIndex="1001";
    } else {
      menu.removeAttribute("style");
    }
  };
  positionMobileMenu();
  addEventListener("resize", positionMobileMenu);
  menu?.addEventListener("click", () => { const open=document.body.classList.toggle("menu-open"); menu.setAttribute("aria-expanded", String(open)); });
  mobileTrigger?.addEventListener("click", () => {
    const open=document.body.classList.toggle("menu-open");
    mobileTrigger.setAttribute("aria-expanded",String(open));
    menu?.setAttribute("aria-expanded",String(open));
  });
  document.querySelectorAll(".nav a").forEach(link => link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menu?.setAttribute("aria-expanded", "false");
    mobileTrigger?.setAttribute("aria-expanded", "false");
  }));
  const siteHeader = document.querySelector(".site-header");
  const setHeader = () => siteHeader?.classList.toggle("is-fixed", scrollY > 90 || !document.querySelector(".hero,.page-hero"));
  addEventListener("scroll", setHeader, {passive:true}); setHeader();
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", updateProgress, {passive:true}); updateProgress();
  if (matchMedia("(pointer:fine)").matches) {
    addEventListener("pointermove", event => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    }, {passive:true});
  }
  const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add("is-visible");observer.unobserve(e.target)}}), {threshold:.13});
  document.querySelectorAll(".reveal,.stagger").forEach(el => observer.observe(el));
  document.querySelectorAll("[data-progress]").forEach(el => { const value=el.dataset.progress; el.style.setProperty("--progress",`${value}%`); const bar=el.querySelector(".progress-track i"); const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){bar.style.width=`${value}%`;io.disconnect()}}));io.observe(el); });
  const cinematicHero = document.querySelector(".cinematic-hero");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (cinematicHero && reduceMotion) {
    cinematicHero.querySelector(".hero-video")?.pause();
  }
  document.querySelectorAll("[data-youtube-embed]").forEach(el => {
    if (config.youtubeLatestVideoEmbedUrl) {
      const latestFrame = document.createElement("iframe");
      latestFrame.src = config.youtubeLatestVideoEmbedUrl;
      latestFrame.title = "Episcopal Church of the Redeemer live or latest service";
      latestFrame.loading = "lazy";
      latestFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      latestFrame.allowFullscreen = true;
      el.replaceChildren(latestFrame);
      return;
    }
    if (!config.youtubeEmbedUrl) return;
    const easternParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false
    }).formatToParts(new Date()).reduce((parts, part) => ({...parts, [part.type]: part.value}), {});
    const minutes = Number(easternParts.hour) * 60 + Number(easternParts.minute);
    const serviceWindow = easternParts.weekday === "Sun" && minutes >= 9 * 60 + 40 && minutes <= 11 * 60 + 45;
    const forceLive = new URLSearchParams(location.search).get("live") === "1";
    if (!serviceWindow && !forceLive) {
      el.classList.add("live-placeholder");
      el.innerHTML = `<div class="live-placeholder-content"><span class="live-placeholder-mark" aria-hidden="true">▶</span><p class="eyebrow gold">Next broadcast</p><h3>Sunday Holy Eucharist</h3><p>Sundays at 10:00 AM Eastern</p><div class="actions"><a class="button button-light" href="${config.youtubeChannelUrl || "#"}" target="_blank" rel="noopener">Visit our YouTube channel</a><a class="button button-outline light" href="${config.youtubeUploadsUrl || "#"}" target="_blank" rel="noopener">Watch a past service</a></div></div>`;
      return;
    }
    const frame = document.createElement("iframe");
    frame.src = config.youtubeEmbedUrl;
    frame.title = "Episcopal Church of the Redeemer livestream";
    frame.loading = "lazy";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    el.replaceChildren(frame);
  });
  document.querySelectorAll("[data-youtube-gallery]").forEach(el => {
    el.href = config.youtubeUploadsUrl || config.youtubeChannelUrl || "#";
  });
  document.querySelectorAll("[data-youtube-playlist]").forEach(el => {
    if (!config.youtubePlaylistEmbedUrl) return;
    const frame = document.createElement("iframe");
    frame.src = config.youtubePlaylistEmbedUrl;
    frame.title = "Redeemer past services playlist";
    frame.loading = "lazy";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    el.replaceChildren(frame);
  });
  document.querySelectorAll(".stream-actions a:first-child").forEach(el => {
    el.href = config.youtubeChannelUrl || "#";
  });
  document.querySelectorAll('a[href*="text=Sunday+Holy+Eucharist+at+Redeemer"]').forEach(el => {
    const url = new URL(el.href);
    url.searchParams.set("details", `Weekly Holy Eucharist at Episcopal Church of the Redeemer. Watch online: ${new URL(href("watch-live.html"), location.href).href}`);
    el.href = url.href;
  });
  document.querySelectorAll('a[href^="mailto:"][href*="Calendar%20event%20request"]').forEach(el => {
    el.href = href("intake.html#calendar-event");
    el.textContent = "Submit event details";
  });
  if (page === "privacy") {
    const serviceHeading = [...document.querySelectorAll(".prose h3")].find(el => el.textContent === "Service providers");
    serviceHeading?.nextElementSibling?.replaceChildren("When configured, form data may be processed through Google Sheets, Google Apps Script, Supabase, and approved email, hosting, or administrative providers. Their privacy and security terms also apply.");
    if (serviceHeading?.nextElementSibling && !document.querySelector("#analytics-privacy")) {
      const heading = document.createElement("h3"); heading.id = "analytics-privacy"; heading.textContent = "Website analytics";
      const copy = document.createElement("p"); copy.textContent = "Redeemer may collect privacy-conscious activity data such as pages viewed, anonymous session identifiers, device category, referring website, scroll depth, and clicks on calendar, video, and giving links. Analytics never include the contents of prayer, pastoral-care, or other form messages and are disabled when a browser sends a Do Not Track signal.";
      serviceHeading.nextElementSibling.after(heading, copy);
    }
  }
  if (location.hash === "#expect") document.querySelector("#service")?.scrollIntoView();
  document.querySelectorAll("[data-calendar-embed]").forEach(el => {
    if (!config.googleCalendarEmbedUrl) {
      el.innerHTML = `<div class="calendar-empty"><span>Calendar connection ready</span><h3>See Redeemer's current public calendar.</h3><p>Add the verified Google Calendar embed address in <code>assets/js/config.js</code> to display events here automatically.</p><a class="button button-primary" href="${config.googleCalendarUrl || "https://redeemerchurchgso.org/calendar-of-events/"}">Open current calendar</a></div>`;
      return;
    }
    const frame=document.createElement("iframe");
    frame.src=config.googleCalendarEmbedUrl; frame.title="Redeemer events calendar"; frame.loading="lazy";
    el.replaceChildren(frame);
  });
  document.querySelectorAll("[data-upcoming-calendar]").forEach(el => {
    if (!config.googleCalendarEmbedUrl) return;
    const pad = value => String(value).padStart(2, "0");
    const calendarDate = date => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 10);
    const url = new URL(config.googleCalendarEmbedUrl);
    url.searchParams.set("mode", "AGENDA");
    url.searchParams.set("dates", `${calendarDate(start)}/${calendarDate(end)}`);
    url.searchParams.set("showTitle", "0");
    url.searchParams.set("showNav", "0");
    url.searchParams.set("showDate", "0");
    url.searchParams.set("showPrint", "0");
    url.searchParams.set("showTabs", "0");
    url.searchParams.set("showCalendars", "0");
    url.searchParams.set("showTz", "0");
    const frame = document.createElement("iframe");
    frame.src = url.href;
    frame.title = "Redeemer events during the next 10 days";
    frame.loading = "eager";
    el.replaceChildren(frame);
  });
  if (config.analyticsEnabled && !document.querySelector('script[data-redeemer-analytics]')) {
    const analytics = document.createElement("script");
    analytics.src = href("assets/js/analytics.js");
    analytics.defer = true;
    analytics.dataset.redeemerAnalytics = "";
    document.head.appendChild(analytics);
  }
})();
