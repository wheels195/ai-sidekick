# CLAUDE.md

## Project Overview

AI Sidekick offers two services for local/service businesses:

1. **Ad Creative** (primary, homepage) — AI-generated ad creatives for local businesses. 5 free sample ads, then paid plans: Standard ($399/mo, 15 ads/mo across 5 concepts + monthly check-in) and Pro ($699/mo, 30 ads/mo). Human-curated, not pure AI slop.
2. **AI Automation** (secondary, /automation) — AI-powered systems (AI voice receptionist, two-way SMS, lead follow-up, AI website chat, review automation) so business owners capture every lead. Backend is GoHighLevel (never mentioned on the website). GHL is NOT a custom product — it's configured with prompts/templates, not "trained" via ML.

We do NOT manage client social media accounts (Facebook, Instagram, WhatsApp) — too much risk and access required.

## Architecture

Static HTML pages deployed on Vercel with serverless functions.
- `index.html` — ad creative landing page (homepage)
- `automation.html` — AI automation landing page (formerly the homepage)
- `hvac.html` — HVAC vertical page (template for other verticals)
- 12 vertical pages total (hvac, med-spa, auto-repair, dental, insurance, real-estate, property-management, cpa, vet, law, staffing, restoration)
- `privacy.html` — privacy policy
- `terms.html` — terms of service
- `api/chat.js` — Vercel serverless function (OpenAI gpt-4o-mini chatbot)
- `api/ads-submit.js` — Vercel serverless function (ad creative form → Google Sheets + Resend email)
- `vercel.json` — Vercel config (serverless function timeouts)
- `images/` — static assets (all images served locally, no external hotlinking)
- OG/Twitter meta tags on all pages for social sharing

## Design System

- **Background:** Light (#fafaf9 warm white) on automation/vertical pages; Dark (#0a0a0a) on homepage (ads)
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

**Ad Creative:**
- Standard: $399/mo — 15 ads/month across 5 concepts, monthly check-in
- Pro: $699/mo — 30 ads/month, priority turnaround
- Free trial: 5 sample ads in 48 hours, no commitment

**AI Automation:**
- Single tier: $397/mo ($266/mo annual), $500 one-time setup. Everything included:
AI voice receptionist, two-way SMS, AI website chat widget, online booking calendar, automated appointment reminders, follow-up sequences, Google review requests, lead pipeline & CRM, Spanish language support, reporting dashboard. Annual billing: $3,192/year (33% savings).

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

- AI chat widget on automation.html (bottom-right FAB, iMessage-style bubbles)
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
- ~~**Ad landing page**~~: Done — ads page is now the homepage
- **Domain**: Site is live at `ai-sidekick.io` via Vercel
