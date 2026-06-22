(() => {
  const config = window.REDEEMER_CONFIG || {};
  const forms = document.querySelectorAll("form[data-submission-form]");
  const setStatus = (form, type, message) => {
    const box = form.querySelector(".form-status");
    box.className = `form-status ${type}`;
    box.textContent = message;
    box.setAttribute("role", type === "error" ? "alert" : "status");
  };
  const collect = form => {
    const data = {};
    new FormData(form).forEach((value,key) => {
      if (key === "website") return;
      data[key] = data[key] ? [].concat(data[key], value) : value;
    });
    return data;
  };
  async function submit(form) {
    if (form.elements.website?.value) return {ok:true};
    if (!config.supabaseUrl || !config.supabaseAnonKey) return {configured:false};
    const fields = collect(form);
    const payload = {
      form_type:form.dataset.formType,
      name:fields.name || [fields.first_name, fields.last_name].filter(Boolean).join(" ") || fields.contact_name || null,
      email:fields.email || null,
      phone:fields.phone || null,
      consent:["yes","on","true"].includes(String(fields.consent || fields.follow_up_consent || "").toLowerCase()),
      payload:fields,
      status:"new",
      source_page:location.href
    };
    const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.submissionsTable || "form_submissions"}`, {
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":config.supabaseAnonKey,"Authorization":`Bearer ${config.supabaseAnonKey}`,"Prefer":"return=minimal"},
      body:JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Submission failed (${response.status})`);
    return {ok:true};
  }
  forms.forEach(form => form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button=form.querySelector('[type="submit"]'); button.disabled=true; button.textContent="Sending…";
    try {
      const result=await submit(form);
      if (!result.configured) setStatus(form,"config","This form is ready, but online submissions have not been connected yet. Please call (336) 275-0033 while configuration is completed.");
      else { setStatus(form,"success","Thank you. Your message has been received."); form.reset(); }
    } catch(error) { console.error(error); setStatus(form,"error","We could not send this form. Please try again or call (336) 275-0033."); }
    finally { button.disabled=false; button.textContent=button.dataset.label || "Submit"; }
  }));
})();
