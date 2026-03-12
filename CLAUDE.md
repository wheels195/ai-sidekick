# CLAUDE.md

## Project Overview

AI Sidekick is a national AI automation service for service businesses. We configure AI-powered systems (AI voice receptionist, missed call text-back, lead follow-up, AI website chat, review automation) so business owners capture every lead. Backend is GoHighLevel (never mentioned on the website). GHL is NOT a custom product — it's configured with prompts/templates, not "trained" via ML. We do NOT manage client social media accounts (Facebook, Instagram, WhatsApp) — too much risk and access required.

## Architecture

Static HTML pages deployed on Vercel with one serverless function for the chatbot.
- `index.html` — main landing page
- `hvac.html` — HVAC vertical page (template for other verticals)
- 12 vertical pages total (hvac, med-spa, auto-repair, dental, insurance, real-estate, property-management, cpa, vet, law, staffing, restoration)
- `privacy.html` — privacy policy
- `terms.html` — terms of service
- `api/chat.js` — Vercel serverless function (OpenAI gpt-4o-mini chatbot)
- `vercel.json` — Vercel config (serverless function timeout)
- `images/` — static assets (all images served locally, no external hotlinking)
- OG/Twitter meta tags on all pages for social sharing

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

Single tier — $397/mo ($266/mo annual), $500 one-time setup. Everything included:
AI voice receptionist, missed call text-back, two-way SMS, AI website chat widget, online booking calendar, automated appointment reminders, follow-up sequences, Google review requests, lead pipeline & CRM, Spanish language support, reporting dashboard. Annual billing: $3,192/year (33% savings).

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

## Chatbot

- AI chat widget on index.html (bottom-right FAB, iMessage-style bubbles)
- Backend: `/api/chat.js` — Vercel serverless, OpenAI gpt-4o-mini
- System prompt in `api/chat.js` covers all services, pricing, FAQs
- OPENAI_API_KEY set in Vercel environment variables
- Welcome screen with quick reply buttons
- Mobile: fullscreen takeover, body scroll lock, safe-area padding

## Next Steps

- ~~**Google Workspace**~~: Done — legal@ai-sidekick.io, info@ai-sidekick.io
- **GA4**: Replace `G-XXXXXXXXXX` placeholder with real measurement ID (all 13 pages)
- **Ad pixels**: Meta Pixel + Google Ads conversion tag (install before running ads)
- **Form backend**: Connect contact forms to Google Sheets + email notification
- **Calendly / booking**: Set up for demo calls, replace `#contact` form links
- **GHL Agency Account**: Sign up, build demo sub-account (fake HVAC business), test full flow
- **Demo site**: One-page site for fake HVAC company with GHL chat widget
- **Ad landing page**: High-conversion page for paid traffic
- **Domain**: Site is live at `ai-sidekick.io` via Vercel
