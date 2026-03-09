# CLAUDE.md

## Project Overview

AI Sidekick is a national AI automation service for service businesses. We install AI-powered systems (AI voice receptionist, missed call text-back, lead follow-up, multi-channel AI chat, review automation) so business owners never lose a customer to a missed call or slow response. Backend is GoHighLevel (never mentioned on the website).

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

- All statistics must be real and sourced with clickable citations
- No fake testimonials (FTC guidelines) — use sourced industry data instead
- No emojis anywhere — use Lucide SVG icons

## Next Steps

- **Form backend**: Connect contact forms to Google Sheets + Resend for email notifications. Two options considered:
  1. Make.com webhook → Google Sheets → Resend (no-code)
  2. Vercel serverless function `/api/submit.js` → Sheets + Resend (fewer moving parts)
- **GA4**: Replace `G-XXXXXXXXXX` placeholder in index.html with real GA4 measurement ID
- **Calendly**: Replace `#contact` form links with real Calendly link when ready
- **Domain**: Site is live at `ai-sidekick.io` via Vercel
