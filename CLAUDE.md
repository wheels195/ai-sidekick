# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

AI Sidekick is a Next.js 15 SaaS platform providing specialized AI assistants for landscaping businesses. **Status: 🚀 PRODUCTION READY** at ai-sidekick.io with full authentication, business intelligence, and cost tracking.

## Development Commands

```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Code linting
```

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Radix UI, Lucide React
- **Backend:** Supabase (PostgreSQL + Auth), OpenAI APIs, Resend Email
- **Deployment:** Vercel with custom domain (ai-sidekick.io)

## Recent Major Updates (January 2025)

### ✅ Core Platform Features
- **Consolidated Tools Dropdown** - Upward-opening with Wrench icon, green pill indicators, themed tooltips
- **Chat Interface** - Full-screen with auto-expanding textarea, inline image generation
- **OpenAI Integration** - GPT-4o/GPT-4o-mini with smart model routing
- **Vector Database** - 501-line landscaping knowledge + user file storage
- **File Processing** - Multi-format upload (PDF, images, docs) with AI analysis
- **Authentication & Analytics** - JWT + email verification, real-time cost tracking
- **Business Intelligence** - 20 hardcoded challenges, mandatory signup data, professional email flow

### ✅ Recent Mobile UX Fixes (Latest Sessions)
- **Speech-to-text functionality** - Fixed transcription API with file streams, microphone hidden on mobile (use iOS keyboard mic)
- **Text formatting consistency** - Unified all AI response formats (web search, vector, files, regular chat) with consistent markdown styling
- **ChatGPT-style design updates** - Rounded-2xl corners, 16px font sizing, "Hey there!" greeting, emerald green headers
- **Chat UI improvements** - Fixed text transparency with solid background, centered scroll button above input
- **Tools dropdown fixes** - Click-outside functionality, category buttons persistent on desktop
- **Hero CTA standardization** - Consistent button sizing across mobile/desktop with gradient styling

## Current Architecture

```
/app/landscaping         # Main chat interface with consolidated tools
/api/chat               # OpenAI streaming with vector knowledge
/api/images/generate    # DALL-E 3 inline generation
/api/files/process      # Multi-format file analysis
/lib/moderation.ts      # Content filtering across all inputs
```

## Environment Variables (Production Ready)

```bash
# Core APIs
OPENAI_API_KEY=sk-proj-...
RESEND_API_KEY=re_...
JWT_SECRET=secure-random-key

# Database
NEXT_PUBLIC_SUPABASE_URL=https://tgrwtbtyfznebqrwenji.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Domain
NEXT_PUBLIC_SITE_URL=https://ai-sidekick.io

# Analytics
ADMIN_API_KEY=...
```

## 🚨 PRIORITY ISSUES & TODO (Next Session)

### Critical Mobile UX Issues
1. **Mobile tools/tips viewport focus** - Clicking tools dropdown causes unwanted page centering, cutting off tools selection and tips visibility
2. **Mobile category flashing** - Page load flashing still persists despite attempts to fix with conditional rendering

### New Feature Requirements
3. **Voice & Accessibility APIs**
   - Text-to-speech integration for chat responses
   - Voice mode for hands-free interaction
   - Language toggle options for internationalization

### Mobile Layout Consistency
4. **CTA button standardization** - Ensure ALL CTA buttons across site are full-width on mobile
5. **Learn page mobile width** - Change /learn page container to full-width on mobile devices

### Technical Debt
- **Performance monitoring** - Add Sentry error tracking
- **A/B testing framework** - Test UI variations and messaging
- **API rate limiting** - Protect against abuse and manage costs

## Development Guidelines

- **Mobile-first design** - All new features must work perfectly on mobile
- **Cost consciousness** - Monitor token usage and API costs for all features
- **Security focus** - All user data protected with proper authentication
- **Performance optimization** - Fast loading and responsive interactions

---

*Last updated: January 2025 - Mobile UX Fixes & Hero CTA Updates*