# CLAUDE.md

## Project Overview

AI Sidekick is a local AI automation service for small businesses in DFW. We install AI-powered systems (missed call text-back, lead follow-up, AI receptionist, review automation) so business owners never lose a customer to a missed call or slow response. Backend is GoHighLevel (never mentioned on the website).

## Architecture

Static HTML pages — no build tools, no framework, no dependencies beyond Google Fonts CDN.
- `index.html` — main landing page
- `hvac.html` — HVAC vertical page (template for other verticals)
- `privacy.html` — privacy policy
- `terms.html` — terms of service
- `images/` — static assets

## Design System

- **Background:** Dark (#0a0a0a)
- **Accent:** Gold (#c9a96e)
- **Banned colors:** No purple, blue, or teal anywhere
- **Display font:** Instrument Serif (Google Fonts)
- **Body font:** DM Sans (Google Fonts)
- **Icons:** Inline Lucide SVGs (no library import, no emojis)
- **Animations:** CSS transitions + IntersectionObserver scroll reveals (`.rv` → `.show`). No libraries.

## Verticals

12 verticals: HVAC, Med Spa, Auto Repair, Dental, Insurance, Real Estate, Property Management, CPA & Bookkeeping, Veterinary, Law Firms, Staffing, Restoration.

All 12 vertical pages are built and live.

## Pricing

$1,500 setup / $399 per month — 4-stage flow (Capture → Book → Follow Up → Grow).

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
- **Calendly**: Replace `#contact` form links with real Calendly link when ready
- **Domain**: Site is live at `ai-sidekick.io` via Vercel
