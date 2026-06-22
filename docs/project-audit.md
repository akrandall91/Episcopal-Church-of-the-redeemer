# Project audit

Audit completed June 22, 2026, before the preservation-first upgrade.

## 1. Existing structure

The project is a dependency-free static website intended for GitHub Pages. At audit time it contained:

- 22 root HTML files, including 21 requested public/utility pages and one hidden admin scaffold.
- Shared presentation in `assets/css/site.css`.
- Shared navigation, footer, animation, campaign progress, and livestream behavior in `assets/js/site.js`.
- Shared form handling in `assets/js/forms.js`.
- Runtime settings in `assets/js/config.js`.
- A unified Supabase schema in `supabase/schema.sql`.
- `sitemap.xml`, `robots.txt`, and a setup-focused `README.md`.
- Four usable WebP church photographs and nine HEIC originals.
- Official Episcopal Church horizontal, vertical, shield, full-color, and knockout PNG/AI files.
- A 37 KB strategy document in `__blueprint_extracted.txt`.

The current homepage and blueprint were preserved in `legacy/` before this upgrade.

## 2. Current homepage sections

1. Cinematic “Sacred Welcome / Living Legacy” hero
2. Sunday at Redeemer
3. Worship and livestream
4. Plan Your Visit preview
5. Getting Here
6. Students, families, and returning members
7. Living Legacy timeline
8. Capital campaign
9. Ministries and community care
10. Final three-action call to action

## 3. Existing features

- Multi-page static architecture with shared header/footer rendering.
- Sticky header and accessible mobile menu.
- Intersection Observer section/card reveals.
- Animated campaign progress.
- YouTube channel livestream embed.
- Responsive layouts and reduced-motion support.
- Eleven front-end intake forms.
- Unified Supabase submission adapter with a visible unconfigured state.
- Honeypot fields, loading states, success states, and error states.
- Admin dashboard concept, sitemap, robots controls, schema.org Church data, and privacy draft.

## 4. Existing links and calls to action

Primary journeys are well represented: Plan a Visit, Watch Live, Support the Campaign, Give, Getting Here, Request Prayer, Request Care, Volunteer, Partner, Join Updates, and ministry/student connection. External links include the official giving page, Facebook, and YouTube.

## 5. Existing JavaScript behavior

- Determines local versus GitHub Pages base paths.
- Injects shared navigation and footer.
- Adds canonical links to interior pages at runtime.
- Toggles the mobile menu and sticky header state.
- Reveals content on scroll.
- Animates campaign progress.
- Injects the configured YouTube livestream iframe.
- Collects form values, posts JSON to Supabase REST, and reports clear UI states.

## 6. Existing forms

At audit time the site included:

- Plan Your Visit
- Prayer Request
- Pastoral Care
- Volunteer
- Ministry Interest
- Student/Family Connection
- Transportation Help
- Campaign Pledge
- Partner Inquiry
- General Contact
- Newsletter

The missing required form was Share a Memory. Prayer contact fields and volunteer consent also needed alignment with the updated brief.

## 7. Existing media and assets

- Four 680-pixel-wide WebP photographs:
  - front exterior
  - sanctuary and altar
  - rear/exterior cross
  - side exterior
- Nine HEIC originals that could not be decoded with the installed local image tools.
- Official Episcopal Church PNG and AI identity files.
- Generated Open Graph placeholder SVG.

The photographs were present but not used in the audited website.

## 8. Existing logo files

The project contains official Episcopal Church:

- horizontal full-color and knockout PNG/AI
- vertical full-color and knockout PNG/AI
- shield full-color and knockout PNG/AI

Originals remain in their source folders. Browser-ready copies are organized under `assets/images/logos/`.

## 9. Existing color palette

The audited palette used warm ivory, paper white, espresso, burgundy, antique gold, muted blue-gray, and parchment. It was elegant and coherent, but burgundy/gold carried more visual weight than the requested Episcopal blue system.

## 10. Existing typography

- Editorial serif: Newsreader
- Body sans serif: DM Sans

Both are readable and appropriate. The upgrade preserves the pairing.

## 11. Content worth preserving

- “Sacred welcome. Living legacy.”
- “All have a place at Redeemer.”
- Visitor-first Sunday guidance.
- Worship in person and online.
- Transportation as hospitality rather than transit software.
- Students/families/returning members framed through belonging and purpose.
- Restoration campaign framing.
- Historic Black Episcopal identity.
- 1909, Civil Rights witness, and 1979 milestones.
- Community care, pastoral care, prayer, service, and partnership pathways.
- GTFS-ready strategy, form/data strategy, footer SEO ideas, and structured data.

## 12. Issues and risks

- No project audit, brand guide, media manifest, media strategy, forms/data guide, or launch checklist.
- No Share a Memory page/form.
- Real photographs and official logo assets were not used.
- Campaign goal and amount raised are illustrative and must not be presented as verified.
- Several historic summaries were less precise than the official church history.
- No structured central content or transit data file.
- The admin page is not authenticated.
- Supabase credentials, CAPTCHA, rate limiting, notifications, and retention policy are not configured.
- HEIC files need a codec/tooling pass before web conversion.
- The privacy policy needs church/legal review.
- Current email address, parking/access details, campaign scope, and National Register status require church confirmation.
- Some text inherited encoding artifacts in documentation.

## 13. Recommended upgrade path

1. Preserve the current build and original assets.
2. Centralize verified facts and explicit confirmation flags in structured data.
3. Use approved church photographs and official Episcopal identity assets.
4. Shift accent hierarchy toward Episcopal blue while retaining restrained red and heritage gold.
5. Add Share a Memory and strengthen history, campaign, transportation, and neighborhood storytelling.
6. Keep the static architecture and small JavaScript footprint.
7. Complete Supabase production hardening and authenticated admin work only after credentials and governance decisions exist.

## Research sources

- [Official Redeemer home](https://redeemerchurchgso.org/)
- [Official Redeemer history](https://redeemerchurchgso.org/our-history/)
- [Official Redeemer about page](https://redeemerchurchgso.org/about-us/)
- [Official Redeemer ministries](https://redeemerchurchgso.org/church-ministries/)
- [Official Redeemer worship](https://redeemerchurchgso.org/worship/)
- [City of Greensboro historic preservation](https://www.greensboro-nc.gov/departments/planning/learn-more-about/historic-preservation)

