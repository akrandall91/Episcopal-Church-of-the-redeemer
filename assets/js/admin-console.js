(() => {
  const config = window.REDEEMER_CONFIG || {};
  const base = config.supabaseUrl;
  const key = config.supabasePublishableKey || config.supabaseAnonKey;
  const storageKey = "redeemer_member_session";
  const loginUrl = "member-login.html?next=admin.html";
  let token = "";
  let events = [];
  let announcements = [];

  const $ = selector => document.querySelector(selector);
  const status = (type, message) => {
    const el = $("[data-admin-status]");
    el.className = `form-status ${type}`;
    el.textContent = message;
  };
  const request = async (path, options = {}) => {
    const response = await fetch(`${base}${path}`, { ...options, headers:{apikey:key, Authorization:`Bearer ${token}`, "Content-Type":"application/json", ...(options.headers || {})} });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.message || detail.msg || detail.error_description || `Request failed (${response.status})`);
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") return null;
    return response.json();
  };
  const session = () => { try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { return null; } };
  const fmt = value => value ? new Date(value).toLocaleString([], {dateStyle:"medium", timeStyle:"short"}) : "—";
  const inputTime = value => value ? new Date(value).toISOString().slice(0,16) : "";
  const button = (label, action, id, secondary = false) => {
    const el=document.createElement("button"); el.type="button"; el.textContent=label; el.dataset.action=action; el.dataset.id=id;
    el.className=secondary ? "admin-link admin-link-muted" : "admin-link"; return el;
  };
  const renderEvents = () => {
    const body=$("[data-event-rows]"); body.replaceChildren();
    events.forEach(item => {
      const row=document.createElement("tr");
      [item.title,fmt(item.starts_at),item.audience,item.status].forEach(value => { const cell=document.createElement("td"); cell.textContent=value; row.appendChild(cell); });
      const actions=document.createElement("td"); actions.append(button("Edit","edit-event",item.id)," ",button("Archive","archive-event",item.id,true)); row.appendChild(actions); body.appendChild(row);
    });
    if (!events.length) { const row=document.createElement("tr"),cell=document.createElement("td"); cell.colSpan=5; cell.textContent="No events yet."; row.appendChild(cell); body.appendChild(row); }
  };
  const renderAnnouncements = () => {
    const body=$("[data-announcement-rows]"); body.replaceChildren();
    announcements.forEach(item => {
      const row=document.createElement("tr");
      [item.title,item.audience,item.status,item.pinned ? "Yes" : "No"].forEach(value => { const cell=document.createElement("td"); cell.textContent=value; row.appendChild(cell); });
      const actions=document.createElement("td"); actions.append(button("Edit","edit-announcement",item.id)," ",button("Archive","archive-announcement",item.id,true)); row.appendChild(actions); body.appendChild(row);
    });
    if (!announcements.length) { const row=document.createElement("tr"),cell=document.createElement("td"); cell.colSpan=5; cell.textContent="No announcements yet."; row.appendChild(cell); body.appendChild(row); }
  };
  const load = async () => {
    [events,announcements]=await Promise.all([
      request("/rest/v1/member_events?select=*&order=starts_at.desc"),
      request("/rest/v1/member_announcements?select=*&order=pinned.desc,published_at.desc")
    ]);
    renderEvents(); renderAnnouncements();
  };
  const resetEvent = () => { const form=$("[data-event-form]"); form.reset(); form.elements.id.value=""; form.elements.status.value="draft"; form.elements.audience.value="public"; };
  const resetAnnouncement = () => { const form=$("[data-announcement-form]"); form.reset(); form.elements.id.value=""; form.elements.status.value="draft"; form.elements.audience.value="members"; };

  const init = async () => {
    const saved=session();
    if (!saved?.access_token) { location.replace(loginUrl); return; }
    token=saved.access_token;
    try {
      const user=await request("/auth/v1/user");
      const roles=await request(`/rest/v1/member_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role`);
      if (!roles.length || !["staff","admin"].includes(roles[0].role)) throw new Error("This account does not have staff access.");
      $("[data-admin-email]").textContent=user.email;
      $("[data-admin-loading]").hidden=true; $("[data-admin-console]").hidden=false;
      await load();
    } catch (error) { $("[data-admin-loading]").textContent=error.message; return; }

    $("[data-event-form]").addEventListener("submit", async event => {
      event.preventDefault(); const form=event.currentTarget; const data=new FormData(form);
      const payload={title:data.get("title").trim(),description:data.get("description").trim() || null,starts_at:new Date(data.get("starts_at")).toISOString(),ends_at:data.get("ends_at") ? new Date(data.get("ends_at")).toISOString() : null,location:data.get("location").trim() || null,registration_url:data.get("registration_url").trim() || null,audience:data.get("audience"),status:data.get("status"),all_day:data.get("all_day") === "on"};
      try { await request(`/rest/v1/member_events${data.get("id") ? `?id=eq.${encodeURIComponent(data.get("id"))}` : ""}`, {method:data.get("id") ? "PATCH" : "POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(payload)}); resetEvent(); await load(); status("success","Event saved."); } catch(error) { status("error",error.message); }
    });
    $("[data-announcement-form]").addEventListener("submit", async event => {
      event.preventDefault(); const form=event.currentTarget; const data=new FormData(form);
      const payload={title:data.get("title").trim(),body:data.get("body").trim(),audience:data.get("audience"),status:data.get("status"),pinned:data.get("pinned") === "on",published_at:data.get("published_at") ? new Date(data.get("published_at")).toISOString() : new Date().toISOString(),expires_at:data.get("expires_at") ? new Date(data.get("expires_at")).toISOString() : null};
      try { await request(`/rest/v1/member_announcements${data.get("id") ? `?id=eq.${encodeURIComponent(data.get("id"))}` : ""}`, {method:data.get("id") ? "PATCH" : "POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(payload)}); resetAnnouncement(); await load(); status("success","Announcement saved."); } catch(error) { status("error",error.message); }
    });
    document.addEventListener("click", async event => {
      const target=event.target.closest("[data-action]"); if (!target) return;
      const action=target.dataset.action,id=target.dataset.id;
      if (action === "edit-event") { const item=events.find(x=>x.id===id),form=$("[data-event-form]"),fields=form.elements; fields.id.value=item.id; fields.title.value=item.title; fields.description.value=item.description||""; fields.starts_at.value=inputTime(item.starts_at); fields.ends_at.value=inputTime(item.ends_at); fields.location.value=item.location||""; fields.registration_url.value=item.registration_url||""; fields.audience.value=item.audience; fields.status.value=item.status; fields.all_day.checked=item.all_day; form.scrollIntoView({behavior:"smooth"}); }
      if (action === "edit-announcement") { const item=announcements.find(x=>x.id===id),form=$("[data-announcement-form]"),fields=form.elements; fields.id.value=item.id; fields.title.value=item.title; fields.body.value=item.body; fields.audience.value=item.audience; fields.status.value=item.status; fields.pinned.checked=item.pinned; fields.published_at.value=inputTime(item.published_at); fields.expires_at.value=inputTime(item.expires_at); form.scrollIntoView({behavior:"smooth"}); }
      if (action.startsWith("archive-")) { const table=action.endsWith("event") ? "member_events" : "member_announcements"; try { await request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status:"archived"})}); await load(); status("success","Item archived."); } catch(error) { status("error",error.message); } }
    });
    $("[data-clear-event]").addEventListener("click",resetEvent); $("[data-clear-announcement]").addEventListener("click",resetAnnouncement);
    $("[data-admin-signout]").addEventListener("click",()=>{ localStorage.removeItem(storageKey); location.replace("member-login.html"); });
  };
  init();
})();
