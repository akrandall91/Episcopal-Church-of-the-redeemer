const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = request.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const publishable = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: publishable, Authorization: auth } });
    if (!userResponse.ok) throw new Error("A valid staff sign-in is required.");
    const user = await userResponse.json();
    const roleResponse = await fetch(`${supabaseUrl}/rest/v1/member_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role`, { headers: { apikey: publishable, Authorization: auth } });
    const roles = await roleResponse.json();
    if (!roleResponse.ok || !["staff", "admin"].includes(roles?.[0]?.role)) throw new Error("Staff access is required.");

    const apiKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID") || "redeemer8716@gmail.com";
    if (!apiKey) throw new Error("GOOGLE_CALENDAR_API_KEY is not configured.");
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("timeMin", new Date(Date.now() - 30 * 86400000).toISOString());
    url.searchParams.set("maxResults", "100");
    const googleResponse = await fetch(url);
    const result = await googleResponse.json();
    if (!googleResponse.ok) throw new Error(result?.error?.message || "Google Calendar could not be read.");
    const events = (result.items || []).filter((item: any) => item.status !== "cancelled").map((item: any) => ({
      google_event_id: item.id,
      google_event_url: item.htmlLink || null,
      title: item.summary || "Untitled event",
      description: item.description || "",
      location: item.location || "",
      starts_at: item.start?.dateTime || `${item.start?.date}T00:00:00`,
      ends_at: item.end?.dateTime || `${item.end?.date}T00:00:00`,
      all_day: Boolean(item.start?.date),
    }));
    return Response.json({ events }, { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Import failed." }, { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
