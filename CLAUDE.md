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

## Recent Major Updates (July 2025)

### ✅ Core Platform Features  
- **Consolidated Tools Dropdown** - Upward-opening with Wrench icon, green pill indicators, themed tooltips
- **Chat Interface** - Full-screen with auto-expanding textarea, inline image generation
- **OpenAI Integration** - GPT-4o/GPT-4o-mini with smart model routing
- **Vector Database** - 501-line landscaping knowledge + user file storage
- **File Processing** - Multi-format upload (PDF, images, docs) with AI analysis
- **Authentication & Analytics** - JWT + email verification, real-time cost tracking
- **Business Intelligence** - 20 hardcoded challenges, mandatory signup data, professional email flow

### ✅ Google Custom Search & Web Intelligence (July 2025)
- **Real-time Web Search** - Google Custom Search API with intelligent query routing
- **Domain Filtering** - Smart detection for industry trends, pricing, and regulatory topics
- **24-hour Caching** - Optimized API costs with Supabase cache system
- **Competitive Intelligence** - Fixed query conversion to prevent irrelevant results
- **Dual API System** - Google Places for local data, Custom Search for industry insights

### ✅ Comprehensive Admin Analytics Dashboard (July 2025)
- **Real-time Business Intelligence** - 100% real data from user activity and API usage
- **Daily/Weekly/Monthly Trackers** - Active users, conversations, costs, new signups
- **Advanced User Analytics** - Engagement scoring, upgrade candidates, retention metrics
- **Cost Analytics** - Model usage distribution, token consumption, cost per user
- **Conversion Funnel** - Signup→Active→Upgrade tracking with real percentages
- **Business Insights** - AI-generated recommendations based on usage patterns
- **Google Analytics Integration** - Client-side tracking active (G-5LGBPTHXJW)

### ✅ Security & Data Integrity Fixes (July 2025)
- **Supabase RLS Security** - Fixed all 8 security issues, enabled Row Level Security
- **Authentication Isolation** - Proper user data separation and service role usage
- **Conversation Persistence** - Fixed chat history saving and loading issues
- **Markdown Formatting** - Unified response styling across all chat features

### ✅ Recent Mobile UX Fixes (Latest Sessions)
- **Speech-to-text functionality** - Fixed transcription API with file streams, microphone hidden on mobile (use iOS keyboard mic)
- **Text formatting consistency** - Unified all AI response formats (web search, vector, files, regular chat) with consistent markdown styling
- **ChatGPT-style design updates** - Rounded-2xl corners, 16px font sizing, "Hey there!" greeting, emerald green headers
- **Chat UI improvements** - Fixed text transparency with solid background, centered scroll button above input
- **Tools dropdown fixes** - Click-outside functionality, category buttons persistent on desktop, z-index issue resolved
- **Hero CTA standardization** - Consistent button sizing across mobile/desktop with gradient styling

### ✅ Homepage & Mobile Optimization Updates (July 2025)
- **Mobile chat controls** - Simplified to "Tools" (blue with wrench icon) and "Tips" (emerald with star icon)
- **Desktop enhancements** - Added "Generate Image" pill, changed language text to "Supports 50+ Languages"
- **Z-index fixes** - Tips dropdown (z-[9999]) now properly appears above chat input area (z-10)
- **Mobile chat preview** - Reorganized bullet points, added language support section with speech/text bullets
- **Prompt buttons** - Uniform sizing on mobile (w-full h-8) for consistent appearance
- **CTA redesign** - Side-by-side "Try for Free" and "How to Use AI Sidekick" with equal sizing
- **Professional icons** - Replaced emojis with Lucide React icons (Shield, BookOpen, Lightbulb, Zap)
- **Bullet positioning** - Properly positioned under respective CTAs on both mobile and desktop

### ✅ Complete API Cost Tracking & Analytics Overhaul (July 31, 2025)
- **Comprehensive API Tracking** - All APIs now tracked: GPT models, Google Places, Google Custom Search, DALL-E, Whisper transcription
- **Admin Dashboard Enhancement** - Fixed "unknown" API labels, added dedicated Costs view with complete breakdowns
- **Missing API Integration** - Added Whisper API cost tracking with user authentication (was completely missing)
- **Real-time Cost Monitoring** - All tokens, API calls, and costs captured in unified dashboard
- **Backend Cost Calculation** - Updated analytics API to aggregate data from both user_conversations and api_usage_tracking tables
- **Frontend Cost Display** - Added all new API costs to admin view across all time periods (today/week/month)

### ✅ Hero Section Professional Redesign (July 31, 2025)
- **Professional SaaS Styling** - Redesigned 6 feature cards for landscaping business owners
- **Black Cards with Emerald Borders** - Unified color scheme replacing multicolor gradients
- **Modern Typography** - Feature cards use sans-serif fonts (cursive preserved elsewhere)
- **Reduced Font Weight** - Titles changed from font-semibold to font-medium for less bold appearance
- **Staggered Fade-in Animation** - Cards animate from left with 200ms delays (0ms, 200ms, 400ms, 600ms, 800ms, 1000ms)
- **Always-visible Success Metrics** - Removed hover-only effects for consistent professional look
- **Subtle Icon Pulse Animation** - Icons pulse every 6 seconds for subtle engagement

### ✅ Marketing & Social Proof Enhancements (July 2025)
- **Demo Video Integration** - Auto-playing product demo video positioned above testimonials section
- **Testimonial Carousel** - New rotating testimonials section showcasing landscaping business success stories
- **Video UX Optimization** - Intersection Observer API for auto-play/pause, muted autoplay for mobile compatibility
- **Social Proof Positioning** - Strategic placement between hero and features for maximum conversion impact

### ✅ Google OAuth Authentication Finalization (July 2025)
- **OAuth 2.0 PKCE Flow** - Fully implemented with proper code verifier and challenge
- **Supabase Integration** - Complete Google OAuth setup with detectSessionInUrl auto-handling
- **Security Compliance** - PKCE (Proof Key for Code Exchange) for enhanced security
- **Session Management** - Automatic callback URL handling and user session persistence
- **Production Ready** - Google OAuth fully tested and deployed for ai-sidekick.io domain

## Current Architecture

```
/app/landscaping                    # Main chat interface with consolidated tools
/app/admin/analytics               # Comprehensive business intelligence dashboard
/api/chat                          # OpenAI streaming with vector + web search
/api/images/generate              # DALL-E 3 inline generation
/api/files/process                # Multi-format file analysis
/api/admin/analytics              # Real-time business metrics API
/lib/chat-enhancements/           # Google APIs and intelligence modules
/lib/moderation.ts                # Content filtering across all inputs
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

# Google APIs
GOOGLE_PLACES_API_KEY=...
GOOGLE_CUSTOM_SEARCH_API_KEY=...
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=43d07c544e509463a

# Analytics & Tracking
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-5LGBPTHXJW
ADMIN_API_KEY=...

# Domain
NEXT_PUBLIC_SITE_URL=https://ai-sidekick.io
```

## 🚀 LAUNCH READINESS STATUS

### ✅ PRODUCTION READY FEATURES
- **Core Platform** - Chat, tools, authentication, file processing 
- **Google Integrations** - Places API + Custom Search with caching + OAuth 2.0 authentication
- **Complete Analytics** - Real-time business intelligence with comprehensive API cost tracking
- **Professional UI** - Hero section redesigned with demo video and testimonials for business trust
- **Security** - RLS enabled, authentication isolation, PKCE OAuth, data protection
- **Mobile Optimization** - Responsive design, touch interactions, video auto-play optimization
- **Cost Optimization** - Smart caching, model routing, complete token tracking

### 🎯 PRE-LAUNCH CHECKLIST (Final Items)

#### Critical Launch Items
1. ✅ **Production Domain Setup** - Environment variables already point to ai-sidekick.io
2. **🚨 URGENT: Email Templates & Flow Redesign** - Current email UI doesn't match website glassmorphism/branding
   - Welcome and verification emails need complete UI overhaul
   - Must match exact website styling: proper glassmorphism, cursive "AI Sidekick" font, gradient buttons
   - User reported emails look "terrible" and don't match website UI whatsoever
   - Unsubscribe page also needs styling fixes
3. **Error Monitoring** - Add Sentry or similar for production error tracking  
4. **API Rate Limiting** - Implement usage limits to prevent abuse

#### Polish & Performance  
5. ✅ **Mobile category flashing** - Fixed page load flashing on chat tools
6. ✅ **Learn page mobile width** - Optimized /learn page for mobile devices
7. **Performance audit** - Optional: Lighthouse optimization and Core Web Vitals (can be done post-launch)

#### Growth & Monetization
8. **Pricing tiers** - Implement subscription plans and upgrade flows
9. **Payment integration** - Stripe or similar for billing
10. **User onboarding** - Guided tutorial for new users

### 🔮 FUTURE ENHANCEMENTS (Post-Launch)

#### Advanced Analytics
- **Google Analytics Data API** - Server-side GA data integration for comprehensive website + app analytics
- **A/B testing framework** - Test UI variations and messaging
- **Advanced business intelligence** - Predictive analytics and user lifecycle tracking

#### Voice & Accessibility
- **Text-to-speech integration** - AI voice responses for hands-free operation
- **Voice mode** - Full voice interaction capabilities
- **Multi-language support** - Internationalization with language toggle

#### Advanced AI Features
- **Custom AI models** - Fine-tuned models for specific landscaping tasks
- **Image analysis** - Advanced plant/property recognition
- **Workflow automation** - AI-powered business process automation

## Development Guidelines

- **Mobile-first design** - All new features must work perfectly on mobile
- **Cost consciousness** - Monitor token usage and API costs for all features
- **Security focus** - All user data protected with proper authentication
- **Performance optimization** - Fast loading and responsive interactions

## 🏆 CODE QUALITY STANDARDS

**CRITICAL: Professional Engineering Standards Only**

- **NEVER provide "good enough" solutions** - All implementations must follow industry best practices
- **No shortcuts or workarounds** - Every solution must be production-ready and maintainable
- **Best practices mandatory** - Use latest patterns, proper error handling, and optimal architecture
- **Professional software engineering only** - Treat every change as production code for enterprise clients

## Chat Enhancement Package (Implemented July 2025)

### Enhanced Features Added:
- **Dynamic Image Analysis** - Context-aware prompts based on user intent and file type
- **Google Places API Caching** - 24-hour Supabase cache reducing API costs ~80%
- **System Prompt Enforcement** - Flexible, creative responses with consistent formatting
- **Professional Table Styling** - Emerald green headers, proper borders, mobile-optimized
- **Increased Results** - Google Places now shows up to 10 results (increased from 3-6)

### Key Files:
- `/lib/chat-enhancements/` - Modular enhancement functions
- `/app/api/chat/route.ts` - Integration with chat API
- `/supabase-migrations/places_cache_table.sql` - Caching infrastructure

## 📊 Business Intelligence Summary

### Real-time Analytics Available:
- **Admin Dashboard**: `/admin/analytics` - Comprehensive business metrics
- **Google Analytics**: Client-side tracking active (G-5LGBPTHXJW)
- **Cost Tracking**: Real-time API usage and token consumption
- **User Analytics**: Engagement scoring, retention, upgrade candidates

### Data Sources:
- **User Activity**: 100% real data from Supabase
- **Cost Metrics**: Actual OpenAI, Google API usage
- **Engagement Scores**: Calculated from real usage patterns
- **Business Insights**: AI-generated recommendations

---

✅ **HOMEPAGE DEMO:** Interactive chat demo on homepage is a marketing feature - keeping for user engagement

---

*Last updated: July 31, 2025 - Complete API Tracking & Hero Section Redesign*