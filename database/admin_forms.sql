-- Secure admin access for form submissions.
-- Run after database/schema.sql and database/member_portal.sql.

drop policy if exists "staff read form submissions" on public.form_submissions;
create policy "staff read form submissions"
on public.form_submissions for select to authenticated
using ((select public.is_member_staff()));

drop policy if exists "staff update form submissions" on public.form_submissions;
create policy "staff update form submissions"
on public.form_submissions for update to authenticated
using ((select public.is_member_staff()))
with check ((select public.is_member_staff()));

grant select, update on public.form_submissions to authenticated;

