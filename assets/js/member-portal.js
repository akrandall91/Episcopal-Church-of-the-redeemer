(() => {
  const config = window.REDEEMER_CONFIG || {
    supabaseUrl: "https://ywsczpdwnkwtsvtudqwp.supabase.co",
    supabasePublishableKey: "sb_publishable_-NHINmz1Mz9RDmhlTCA78A_Wr_rwrQ0"
  };
  const key = config.supabasePublishableKey || config.supabaseAnonKey;
  const base = config.supabaseUrl;
  const storageKey = "redeemer_member_session";
  const pageBase = location.pathname.includes("/Episcopal-Church-of-the-redeemer/") ? "/Episcopal-Church-of-the-redeemer/" : "/";
  const memberUrl = page => `${pageBase}${page}`;

  const setStatus = (element, type, message) => {
    if (!element) return;
    element.className = `form-status ${type}`;
    element.textContent = message;
    element.setAttribute("role", type === "error" ? "alert" : "status");
  };
  const readSession = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "null"); }
    catch { return null; }
  };
  const saveSession = session => {
    const stored = {...session, expires_at: Date.now() + Number(session.expires_in || 3600) * 1000};
    localStorage.setItem(storageKey, JSON.stringify(stored));
    return stored;
  };
  const clearSession = () => localStorage.removeItem(storageKey);
  const request = async (path, options = {}, token = "", attempt = 0) => {
    if (!base || !key) throw new Error("Member access has not been configured.");
    const headers = {apikey:key, "Content-Type":"application/json", ...(options.headers || {})};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${base}${path}`, {...options, headers});
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      const message = detail.msg || detail.message || detail.error_description || `Request failed (${response.status})`;
      if (attempt === 0 && /JWT issued at future/i.test(message)) {
        await new Promise(resolve => setTimeout(resolve, 4000));
        return request(path, options, token, attempt + 1);
      }
      throw new Error(message);
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") return null;
    return response.json();
  };
  const activeSession = async () => {
    let session = readSession();
    if (!session) return null;
    if (session.expires_at > Date.now() + 60000) return session;
    try {
      const refreshed = await request("/auth/v1/token?grant_type=refresh_token", {
        method:"POST", body:JSON.stringify({refresh_token:session.refresh_token})
      });
      session = saveSession(refreshed);
      return session;
    } catch {
      clearSession();
      return null;
    }
  };
  const createCard = (title, body, meta = "") => {
    const article = document.createElement("article");
    article.className = "member-card";
    if (meta) { const small=document.createElement("small"); small.textContent=meta; article.appendChild(small); }
    const heading=document.createElement("h3"); heading.textContent=title; article.appendChild(heading);
    const copy=document.createElement("p"); copy.textContent=body || ""; article.appendChild(copy);
    return article;
  };
  const emptyState = message => { const p=document.createElement("p"); p.className="member-empty"; p.textContent=message; return p; };

  const setupLogin = async () => {
    if (await activeSession()) { location.replace(memberUrl("member-dashboard.html")); return; }
    const loginForm = document.querySelector("[data-member-login]");
    const status = document.querySelector("[data-member-status]");
    const hash = new URLSearchParams(location.hash.slice(1));
    if (["invite","recovery","signup"].includes(hash.get("type")) && hash.get("access_token")) {
      const card = document.querySelector(".member-auth-card");
      card.innerHTML = `<h2>Choose a new password</h2><form data-member-new-password class="form-grid"><div class="field full"><label for="new-member-password">New password</label><input id="new-member-password" name="password" type="password" minlength="8" autocomplete="new-password" required></div><div class="field full"><button class="button button-primary" type="submit">Update password</button><div class="form-status" data-member-status></div></div></form>`;
      card.querySelector("form").addEventListener("submit", async event => {
        event.preventDefault();
        const nextStatus=card.querySelector("[data-member-status]");
        try {
          await request("/auth/v1/user", {method:"PUT", body:JSON.stringify({password:event.currentTarget.password.value})}, hash.get("access_token"));
          setStatus(nextStatus,"success","Password updated. You may now sign in.");
          history.replaceState(null,"",memberUrl("member-login.html"));
        } catch (error) { setStatus(nextStatus,"error",error.message); }
      });
      return;
    }
    loginForm?.addEventListener("submit", async event => {
      event.preventDefault();
      const button=event.currentTarget.querySelector("button[type=submit]");
      button.disabled=true;
      setStatus(status,"config","Signing in…");
      try {
        const session = await request("/auth/v1/token?grant_type=password", {
          method:"POST", body:JSON.stringify({email:event.currentTarget.email.value,password:event.currentTarget.password.value})
        });
        saveSession(session);
        location.assign(memberUrl("member-dashboard.html"));
      } catch (error) { setStatus(status,"error",error.message); }
      finally { button.disabled=false; }
    });
    document.querySelector("[data-member-reset]")?.addEventListener("click", async () => {
      const email=loginForm?.email.value.trim();
      if (!email) { setStatus(status,"error","Enter your email address first."); return; }
      try {
        await request("/auth/v1/recover", {method:"POST",body:JSON.stringify({email,redirect_to:new URL(memberUrl("member-login.html"),location.origin).href})});
        setStatus(status,"success","If that address has a member account, a reset email is on the way.");
      } catch (error) { setStatus(status,"error",error.message); }
    });
  };

  const setupDashboard = async () => {
    const session=await activeSession();
    if (!session) { location.replace(memberUrl("member-login.html")); return; }
    const token=session.access_token;
    try {
      const user=await request("/auth/v1/user",{},token);
      const [profiles,announcements,events,resources] = await Promise.all([
        request(`/rest/v1/member_profiles?id=eq.${encodeURIComponent(user.id)}&select=*`,{},token),
        request("/rest/v1/member_announcements?select=*&order=published_at.desc",{},token),
        request(`/rest/v1/member_events?select=*&starts_at=gte.${encodeURIComponent(new Date().toISOString())}&order=starts_at.asc`,{},token),
        request("/rest/v1/member_resources?select=*&order=category.asc,title.asc",{},token)
      ]);
      const profile=profiles[0] || {display_name:"",phone:"",directory_opt_in:false,communication_opt_in:true};
      document.querySelector("[data-member-name]").textContent=profile.display_name || user.email.split("@")[0];
      document.querySelector("[data-member-email]").textContent=user.email;
      const profileForm=document.querySelector("[data-member-profile]");
      profileForm.display_name.value=profile.display_name || "";
      profileForm.phone.value=profile.phone || "";
      profileForm.directory_opt_in.checked=profile.directory_opt_in;
      profileForm.communication_opt_in.checked=profile.communication_opt_in;

      const announcementsBox=document.querySelector("[data-member-announcements]"); announcementsBox.replaceChildren();
      announcements.forEach(item => announcementsBox.appendChild(createCard(item.title,item.body,new Date(item.published_at).toLocaleDateString())));
      if (!announcements.length) announcementsBox.appendChild(emptyState("No current announcements."));

      const eventsBox=document.querySelector("[data-member-events]"); eventsBox.replaceChildren();
      events.forEach(item => {
        const article=createCard(item.title,item.description || "",new Date(item.starts_at).toLocaleString());
        if (item.location) { const locationLine=document.createElement("strong"); locationLine.textContent=item.location; article.appendChild(locationLine); }
        eventsBox.appendChild(article);
      });
      if (!events.length) eventsBox.appendChild(emptyState("No member events have been posted yet."));

      const resourcesBox=document.querySelector("[data-member-resources]"); resourcesBox.replaceChildren();
      resources.forEach(item => {
        const article=createCard(item.title,item.description || "",item.category);
        const link=document.createElement("a"); link.className="text-link"; link.href=item.url; link.target="_blank"; link.rel="noopener"; link.textContent="Open resource →"; article.appendChild(link); resourcesBox.appendChild(article);
      });
      if (!resources.length) resourcesBox.appendChild(emptyState("Member resources will appear here."));

      document.querySelector("[data-member-loading]").hidden=true;
      document.querySelector("[data-member-dashboard]").hidden=false;
      profileForm.addEventListener("submit", async event => {
        event.preventDefault();
        const profileStatus=document.querySelector("[data-profile-status]");
        try {
          await request(`/rest/v1/member_profiles?id=eq.${encodeURIComponent(user.id)}`, {
            method:"PATCH", headers:{Prefer:"return=minimal"}, body:JSON.stringify({display_name:event.currentTarget.display_name.value.trim(),phone:event.currentTarget.phone.value.trim() || null,directory_opt_in:event.currentTarget.directory_opt_in.checked,communication_opt_in:event.currentTarget.communication_opt_in.checked})
          },token);
          setStatus(profileStatus,"success","Profile saved.");
        } catch (error) { setStatus(profileStatus,"error",error.message); }
      });
    } catch (error) {
      const loading=document.querySelector("[data-member-loading]");
      const message=document.createElement("p"); message.className="member-error"; message.textContent=error.message;
      const back=document.createElement("a"); back.className="button button-outline"; back.href=memberUrl("member-login.html"); back.textContent="Return to sign in";
      loading.replaceChildren(message,back);
    }
    document.querySelector("[data-member-signout]")?.addEventListener("click", async () => {
      try { await request("/auth/v1/logout",{method:"POST"},token); } catch {}
      clearSession(); location.replace(memberUrl("member-login.html"));
    });
  };

  const view=document.body.dataset.memberView;
  if (view === "login") setupLogin();
  if (view === "dashboard") setupDashboard();
})();
