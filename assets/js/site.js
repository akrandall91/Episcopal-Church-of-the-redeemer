(() => {
  document.documentElement.classList.add("js");
  const config = window.REDEEMER_CONFIG || {};
  const onPages = location.protocol === "file:" ? "" : (location.pathname.includes("/Episcopal-Church-of-the-redeemer/") ? config.basePath : "/");
  const href = page => `${onPages}${page}`;
  const page = document.body.dataset.page || "";
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
    ["ministries","Ministries","ministries.html"],["history","History","history.html"],["getting-here","Getting Here","getting-here.html"],
    ["give","Give","give.html"],["contact","Contact","contact.html"]
  ];
  const header = document.querySelector("[data-site-header]");
  if (header) header.innerHTML = `<header class="site-header"><div class="shell"><a class="brand" href="${href("index.html")}"><img class="brand-shield" src="${href("assets/images/logos/episcopal-shield.png")}" alt=""><span><strong>Church of the Redeemer</strong><small>Greensboro · Est. 1909</small></span></a><button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button><nav class="nav" id="site-nav" aria-label="Primary">${links.map(([id,label,url])=>`<a ${page===id?'aria-current="page"':''} href="${href(url)}">${label}</a>`).join("")}<a class="nav-cta" href="${href("visit.html#visit-form")}">Plan a visit</a></nav></div></header>`;
  const footer = document.querySelector("[data-site-footer]");
  if (footer) footer.innerHTML = `<footer class="site-footer"><div class="shell"><div class="footer-grid"><div><a class="brand" href="${href("index.html")}"><img class="brand-shield brand-shield-ko" src="${href("assets/images/logos/episcopal-shield-ko.png")}" alt=""><span><strong>Church of the Redeemer</strong><small>Greensboro · Est. 1909</small></span></a><p>A historic Black Episcopal parish. A church home for every generation.</p><p>901 E Friendly Ave<br>Greensboro, NC 27401<br><a href="tel:+13362750033">(336) 275-0033</a></p></div><div><h3>Welcome</h3><ul><li><a href="${href("visit.html")}">Plan Your Visit</a></li><li><a href="${href("getting-here.html")}">Getting Here</a></li><li><a href="${href("students-families.html")}">Students & Families</a></li><li><a href="${href("calendar.html")}">Calendar</a></li><li><a href="${href("share-a-memory.html")}">Share a Memory</a></li></ul></div><div><h3>Worship & care</h3><ul><li><a href="${href("watch-live.html")}">Watch Live</a></li><li><a href="${href("prayer-request.html")}">Prayer Request</a></li><li><a href="${href("pastoral-care.html")}">Pastoral Care</a></li><li><a href="${href("volunteer.html")}">Volunteer</a></li><li><a href="${href("give.html")}">Give</a></li></ul></div><div><h3>Stay connected</h3><p>Sunday Holy Eucharist at 10:00 AM.<br>Church School at 9:00 AM.</p><a class="button button-light" href="${href("newsletter.html")}">Join our newsletter</a><p><a href="https://www.facebook.com/EpiscopalRedeemergso/">Facebook</a> · <a href="${config.youtubeChannelUrl || "#"}">YouTube</a></p><img class="tec-footer-logo" src="${href("assets/images/logos/episcopal-church-horizontal-ko.png")}" alt="The Episcopal Church"></div></div><p class="episcopal-identity">A congregation of the Episcopal Diocese of North Carolina, The Episcopal Church, and the Anglican Communion.</p><div class="footer-bottom"><p>© 2026 Episcopal Church of the Redeemer</p><p><a href="${href("privacy.html")}">Privacy</a> · <a href="${href("member-updates.html")}">Member updates</a></p></div></div></footer>`;
  const menu = document.querySelector(".menu-button");
  let mobileTrigger = null;
  if (innerWidth <= 980) {
    mobileTrigger=document.createElement("button");
    mobileTrigger.type="button";
    mobileTrigger.className="mobile-menu-trigger";
    mobileTrigger.setAttribute("aria-expanded","false");
    mobileTrigger.setAttribute("aria-controls","site-nav");
    mobileTrigger.textContent="Menu";
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
  const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add("is-visible");observer.unobserve(e.target)}}), {threshold:.13});
  document.querySelectorAll(".reveal,.stagger").forEach(el => observer.observe(el));
  document.querySelectorAll("[data-progress]").forEach(el => { const value=el.dataset.progress; el.style.setProperty("--progress",`${value}%`); const bar=el.querySelector(".progress-track i"); const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){bar.style.width=`${value}%`;io.disconnect()}}));io.observe(el); });
  const cinematicHero = document.querySelector(".cinematic-hero");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if (cinematicHero && reducedMotion.matches) {
    cinematicHero.querySelector("video")?.pause();
  }
  if (cinematicHero && matchMedia("(pointer: fine)").matches && !reducedMotion.matches) {
    cinematicHero.addEventListener("pointermove", event => {
      const rect = cinematicHero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      cinematicHero.style.setProperty("--mx", `${x}%`);
      cinematicHero.style.setProperty("--my", `${y}%`);
      cinematicHero.style.setProperty("--hero-x", `${x}%`);
      cinematicHero.style.setProperty("--hero-y", `${y}%`);
      cinematicHero.style.setProperty("--parallax-x", `${(x - 50) * -0.06}px`);
      cinematicHero.style.setProperty("--parallax-y", `${(y - 50) * -0.08}px`);
    }, {passive:true});
  }
  if (cinematicHero && !reducedMotion.matches) {
    const heroVideo = cinematicHero.querySelector(".hero-video");
    const cue = cinematicHero.querySelector(".scroll-cue");
    const syncHeroScroll = () => {
      const rect = cinematicHero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, Math.abs(rect.top) / cinematicHero.offsetHeight));
      cinematicHero.style.setProperty("--scroll-scale", String(1.06 + progress * 0.1));
      cinematicHero.style.setProperty("--scroll-y", `${progress * -22}px`);
      cinematicHero.style.setProperty("--headline-opacity", String(Math.max(0, 1 - progress * 1.35)));
      cinematicHero.style.setProperty("--headline-y", `${progress * -18}px`);
      if (heroVideo && progress > 0.01) heroVideo.style.animation = "none";
      if (cue) {
        if (progress > 0.01) cue.style.animation = "none";
        cue.style.opacity = String(Math.max(0, 1 - progress * 4));
      }
    };
    addEventListener("scroll", syncHeroScroll, {passive:true});
    syncHeroScroll();
  }
  document.querySelectorAll("[data-youtube-embed]").forEach(el => {
    if (!config.youtubeEmbedUrl) return;
    const frame = document.createElement("iframe");
    frame.src = config.youtubeEmbedUrl;
    frame.title = "Episcopal Church of the Redeemer livestream";
    frame.loading = "lazy";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    el.replaceChildren(frame);
  });
})();
