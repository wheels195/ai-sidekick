# CLAUDE.md

## Project Overview

AI Sidekick is a national AI automation service for service businesses. We configure AI-powered systems (AI voice receptionist, missed call text-back, lead follow-up, multi-channel AI chat, review automation) so business owners capture every lead. Backend is GoHighLevel (never mentioned on the website). GHL is NOT a custom product — it's configured with prompts/templates, not "trained" via ML.

## Architecture

Static HTML pages — no build tools, no framework, no dependencies beyond Google Fonts CDN.
- `index.html` — main landing page
- `hvac.html` — HVAC vertical page (template for other verticals)
- `privacy.html` — privacy policy
- `terms.html` — terms of service
- `images/` — static assets (all images served locally, no external hotlinking)

## Design System

- **Background:** Light (#fafaf9 warm white)
- **Accent:** Navy (#1a3a5c)
- **Banned colors:** No purple or teal anywhere
- **Display font:** Instrument Serif (Google Fonts)
- **Body font:** DM Sans (Google Fonts)
- **Icons:** Inline Lucide SVGs (no library import, no emojis)
- **Animations:** CSS transitions + IntersectionObserver scroll reveals (`.rv` → `.show`). No libraries.

## Verticals

12 verticals: HVAC, Med Spa, Auto Repair, Dental, Insurance, Real Estate, Property Management, CPA & Bookkeeping, Veterinary, Law Firms, Staffing, Restoration.

All 12 vertical pages are built and live.

## Pricing

3 tiers:
- **Starter** — $297/mo, $997 setup (missed call text-back, SMS, booking, reminders, review requests, reports, CRM)
- **Growth** — $497/mo, $1,500 setup (adds AI Voice Receptionist, website chat widget, follow-up sequences, human handoff)
- **Autopilot** — $797/mo, $2,500 setup (adds multi-channel AI, Spanish language, outbound AI calls, AI review responses, analytics dashboard, priority support)

## CTA Links

All CTA buttons scroll to `#contact` form on the page.

## Content Rules

- All statistics must be real and sourced with clickable citations (no unsourced numbers)
- No fake testimonials (FTC guidelines) — use sourced industry data instead
- No emojis anywhere — use Lucide SVG icons
- No cliche AI marketing language: "without lifting a finger", "through the cracks", "never sleeps", "game-changer", "supercharge", "nurtured", "personal touchpoint", "pipeline goes dark"
- No vague claims: "matches your brand voice/tone", "feels like a team member", "personalized", "seamless"
- Use "configured" not "trained" when describing AI setup (GHL is template config, not ML training)
- Be honest about integrations: GHL does NOT natively integrate with industry software (ServiceTitan, Dentrix, Clio, etc.) — say so, mention Zapier/Make as option
- No compliance claims (HIPAA, state bar, etc.) — recommend consulting their own compliance team
- No false social proof — this is a new business with zero clients
- "On autopilot" is OK in the hero headline only (user preference) but avoid elsewhere
- Copy should be specific and factual, not aspirational or fear-based

## Logo

- `images/logo.png` — AS monogram, used in nav and footer on all pages
- `images/favicon.png` — favicon (same logo)

## Next Steps

- **GHL Agency Account**: Need to sign up, build demo sub-account (fake HVAC business), test full flow
- **Demo site**: Build a simple one-page site for fake HVAC company with GHL chat widget embedded
- **Calendly**: Set up for AI Sidekick's own sales/demo calls, replace `#contact` form links
- **GA4**: Replace `G-XXXXXXXXXX` placeholder with real GA4 measurement ID
- **Form backend**: Connect contact forms to Google Sheets + Resend (or replace with Calendly embed)
- **Domain**: Site is live at `ai-sidekick.io` via Vercel
