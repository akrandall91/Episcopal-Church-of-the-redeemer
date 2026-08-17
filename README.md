# Episcopal Church of the Redeemer website

A preservation-first, dependency-free, multi-page website for a historic Black Episcopal parish in Greensboro, North Carolina. The front end deploys directly to GitHub Pages and the form layer is ready for a secured Supabase backend.

## Project structure

- Root `*.html`: public pages and utility/admin scaffolds
- `assets/css/`: shared visual system and responsive behavior
- `assets/js/`: shared site, configuration, and form adapter
- `assets/images/`: organized web media and official logo copies
- `assets/originals/`: untouched source photographs
- `src/data/`: structured verified content and future transit data
- `content/`: media manifest
- `database/`: current production-oriented SQL schema
- `supabase/`: compatibility copy of the earlier schema
- `docs/`: audit, brand, media, data, and launch documentation
- `legacy/`: preserved baseline homepage, blueprint, and inventory

## Run locally

No build step is required.

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push the repository to the publishing branch.
2. Open **Settings → Pages** in GitHub.
3. Choose **Deploy from a branch**, select the branch, and `/ (root)`.
4. Confirm `basePath` in `assets/js/config.js` matches `/Episcopal-Church-of-the-redeemer/`.
5. Smoke-test navigation, media, forms, canonical URLs, and the YouTube embed from the live Pages URL.

## Backend and environment configuration

Runtime settings are in `assets/js/config.js`:

```js
supabaseUrl: "https://YOUR_PROJECT.supabase.co",
supabasePublishableKey: "YOUR_PUBLISHABLE_KEY"
```

Never commit a Supabase service-role key. For production:

1. Create a Supabase project.
2. Run `database/schema.sql`.
3. Add the project URL and anonymous key.
4. Route submissions through a Supabase Edge Function.
5. Add server-verified Turnstile/hCaptcha, rate limiting, payload limits, and redacted notifications.
6. Define retention and access rules, especially for prayer, pastoral care, and shared memories.

Without credentials, forms validate normally and show a clear configuration warning. They never pretend a submission was delivered.

Netlify Forms, Vercel/serverless, or Google Apps Script can be added as alternative adapters inside `assets/js/forms.js`. Preserve the same loading/success/error/configuration state contract.

## Forms

Thirteen form types submit through one abstraction:

- visit
- prayer
- pastoral care
- volunteer
- ministry interest
- student/family connection
- transportation
- campaign pledge
- partner inquiry
- contact
- newsletter
- share a memory
- service participation

See `docs/forms-and-data.md`.

## Admin and CSV export

`admin.html` is an authenticated staff content console for publishing calendar events and member announcements. Run `database/admin_content.sql` after `database/member_portal.sql`, promote authorized accounts to `staff` or `admin`, then sign in through `member-login.html?next=admin.html`. Supabase row-level security remains the authority for every read and write.

The console accepts one PDF or image attachment per event (PDF, JPG, PNG, WebP, or GIF, up to 10 MB). Files are stored in the private `event-attachments` Supabase Storage bucket and are exposed only through short-lived signed links when the event audience permits access.

Run `database/admin_forms.sql` to enable the staff-only Forms workspace. It provides submission search and filtering, workflow statuses, private follow-up notes, detail review, and CSV export while preserving the public insert-only policy.

To enable **Import from Google Calendar**, enable the Google Calendar API, create an API key restricted to that API, and add `GOOGLE_CALENDAR_API_KEY` plus `GOOGLE_CALENDAR_ID` as Supabase Edge Function secrets. Deploy `supabase/functions/google-calendar-import`, which is restricted to signed-in staff and admin accounts. The default calendar ID is `redeemer8716@gmail.com`.

Until then, authorized staff can filter and export CSV using the Supabase table editor.

## Invitation-only member portal

The member portal UI lives in `member-login.html` and `member-dashboard.html`. To enable it:

1. Run `database/member_portal.sql` in the Supabase SQL Editor after `database/schema.sql`.
2. Set the Supabase Auth Site URL to the deployed website and allow `member-login.html` as a redirect URL.
3. Invite members from **Authentication → Users → Add user → Send invitation**.
4. Promote the initial staff administrator using the commented SQL statement at the end of `database/member_portal.sql`.

Member access is enforced by Supabase Auth and row-level policies, not by the pages being hidden from navigation or search.

## Edit church content

Verified structured content lives in `src/data/siteContent.js`. Update page copy as needed, but keep uncertain items labeled **Needs church confirmation**.

Current primary sources:

- `https://redeemerchurchgso.org/`
- `https://redeemerchurchgso.org/about-us/`
- `https://redeemerchurchgso.org/our-history/`
- `https://redeemerchurchgso.org/church-ministries/`
- `https://redeemerchurchgso.org/worship/`

### Worship times

Update `src/data/siteContent.js`, homepage service notes, relevant interior pages, footer output in `assets/js/site.js`, and schema data if service times are added there.

### Livestream

Update `youtubeChannelUrl` and `youtubeEmbedUrl` in `assets/js/config.js`.

### Campaign numbers

`campaignGoal` and `campaignRaised` in `assets/js/config.js` and the displayed values in `index.html` and `capital-campaign.html` are prototype values. Verify them with the church before launch.

### Events

Public events are managed in `admin.html` and rendered from Supabase in `calendar.html`. Each published event includes an Add to Google Calendar link.

## Add pages

Copy a current interior page and update:

- title and description
- Open Graph fields when a page-specific image is available
- `data-page`
- one clear `h1`
- page content and calls to action

Shared header/footer and base-path handling come from `assets/js/site.js`.

## Add photos and video

Read `content/media-manifest.json` and `docs/media-strategy.md`.

Use:

- `assets/images/hero/`
- `assets/images/worship/`
- `assets/images/history/`
- `assets/images/community/`
- `assets/images/campaign/`
- `assets/images/transportation/`
- `assets/images/ministries/`
- `assets/images/leadership/`
- `assets/images/details/`
- `assets/images/logos/`
- `assets/video/`

Keep originals in `assets/originals/`. Use descriptive filenames, intrinsic dimensions, useful alt text, responsive sizing, and lazy loading below the fold.

Nine HEIC files remain unconverted because installed tools could not decode them safely. Convert with a trusted HEIC-aware workflow, review orientation and color, and preserve the originals.

## Branding

Read `docs/brand-system.md`. Official Episcopal Church artwork must not be recolored, distorted, or recreated. Blue is the primary accent; red and gold are controlled identity details.

## Accessibility and motion

The site includes semantic landmarks, skip links, labels, visible focus behavior, responsive navigation, native validation, tap-sized controls, and reduced-motion support. Final launch still requires keyboard, screen-reader, contrast, zoom, and Lighthouse testing.

## Known limitations

- Production form credentials and server-side spam protection are not configured.
- Admin authentication and real dashboard queries are not implemented.
- Campaign figures, giving levels, scope, and contact require church confirmation.
- Parking, entrance, accessibility, email, and transportation route details require church confirmation.
- Calendar and GTFS feeds are not live.
- HEIC originals need conversion and visual review.
- Photo upload for shared memories is intentionally disabled until secure storage exists.
- Privacy language requires church/legal review.
- SEO landing pages should only be added when each can offer substantial, locally useful content; thin keyword pages were intentionally avoided.

## Launch

Follow `docs/launch-checklist.md`. Do not publish confidential submissions, unverified campaign figures, uncertain preservation status, or private member information.
