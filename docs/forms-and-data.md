# Forms and data

## Architecture

All forms use `assets/js/forms.js`. The adapter currently supports Supabase REST and an explicit unconfigured state. It never reports success unless the backend accepts the request.

The unified `form_submissions` table stores:

- UUID
- form type
- optional normalized name/email/phone/consent fields
- JSON payload
- workflow status
- source page
- internal notes
- created and updated timestamps

## Form types

- visit
- prayer
- pastoral_care
- volunteer
- ministry_interest
- student_family
- transportation
- campaign_pledge
- partner
- contact
- newsletter
- memory
- service_participation

## Production requirements

1. Configure Supabase URL and anonymous key.
2. Apply `database/schema.sql`.
3. Route public submissions through a server/Edge Function.
4. Verify Cloudflare Turnstile or hCaptcha server-side.
5. Add rate limiting and payload-size limits.
6. Keep prayer and pastoral-care details out of notification email bodies.
7. Define authorized roles, retention periods, deletion procedures, and breach response.
8. Add authenticated dashboard queries and CSV export.

## Other adapters

The abstraction can be extended for Netlify Forms, a Vercel/serverless endpoint, or Google Apps Script. Add a new adapter inside `submit()` and keep the same UI state contract: loading, success, configuration warning, and error.

## Local development

When credentials are blank, forms remain fully navigable and validatable, then show a configuration warning with the church phone number. They do not store data locally or imply delivery.
