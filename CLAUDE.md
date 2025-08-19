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

## Development Workflow & Deployment Strategy

### **Production Environment**
- **Live Site:** ai-sidekick.io (Facebook/Instagram ads running - $10/day budget)
- **Branch:** `main` only deploys to production
- **User Base:** Active users with live ad traffic (400+ impressions, 14 clicks as of August 19, 2025)

### **Development Workflow (August 19, 2025)**
**CRITICAL: Never push directly to production with live users and ads running**

#### **Branch Strategy:**
- **`main`** → Production (ai-sidekick.io) - LIVE users
- **`develop`** → Staging branch for final review
- **`feature/*`** → Individual features and changes

#### **Development Process:**
```bash
# 1. Create feature branch for ANY change
git checkout main && git pull origin main
git checkout -b feature/descriptive-name

# 2. Make changes and push to feature branch
git add . && git commit -m "Description"
git push origin feature/descriptive-name

# 3. Vercel automatically creates preview URL
# Test thoroughly on preview before merging

# 4. When ready for production:
git checkout main && git merge feature/descriptive-name
git push origin main  # Goes LIVE immediately
```

#### **When to Use Preview vs Production:**
- **Preview (feature branches):** ALL development, testing, client reviews, experimental changes
- **Production (main):** Only final approved changes, critical hotfixes, or explicitly requested deployments

### **Analytics & Marketing Status**
- **Google Analytics:** Active (G-5LGBPTHXJW) with comprehensive event tracking
- **Meta Pixel:** Active for Facebook/Instagram ad attribution
- **Ad Performance:** Day 3 of testing ($10/day budget) - 400+ impressions, 14 clicks, 0 conversions (normal for early testing)

## Recent Major Updates (August 2025)

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

### ✅ Critical Security Updates (August 9, 2025)
- **Password Security** - Upgraded from SHA-256 to bcrypt with salt rounds (12)
- **Admin Panel Security** - Fixed public access vulnerability, now requires authentication
- **Analytics Dashboard** - Added proper authentication check for admin@ai-sidekick.io only
- **API Key Security** - Removed development bypasses, enforced production security
- **Supabase RLS Security** - All 8 tables have Row Level Security enabled and verified
- **Authentication Isolation** - Proper user data separation and service role usage
- **Conversation Persistence** - Fixed chat history saving and loading issues
- **Markdown Formatting** - Unified response styling across all chat features

### ✅ Comprehensive Chat Stack Audit & Security Hardening (August 14, 2025)
- **XSS Protection Complete** - DOMPurify sanitization across all dangerouslySetInnerHTML sites (client-page.tsx, page-working.tsx, chart.tsx)
- **Zero Secret Logging** - Eliminated all API key/token logging from codebase, including error handlers and middleware
- **Service Role Security** - Replaced HTTP Bearer token calls with in-process service client for enhanced security
- **Production Temperature Routing** - Intent-aware AI responses (0.2 factual, 0.5 scripts/default, 0.7 brainstorm) for business-appropriate output
- **Enhanced Google CSE** - Dynamic date restrictions (trends=d90, regulatory=y2, default=y1) with sort=date for fresher results
- **Smart Places API** - Rating-based sorting, de-duplication, coordinate-enhanced cache keys with 50km location bias
- **RAG Optimization** - Removed user-visible provenance, added 0.65 fallback threshold, capped chunks for cleaner responses
- **Dynamic Geocoding System** - First-use ZIP→lat/lng persistence with smart coordinate reuse for nationwide accuracy

### ✅ Hero Section Clarity Improvements (August 19, 2025)
- **Subtitle Optimization** - Changed from vague benefits to specific capabilities and outcomes
- **Language Support Highlight** - Added "50+ languages" as key differentiator in subtitle
- **Clear Value Proposition** - Made it explicit that AI Sidekick is an interactive chat tool
- **10-Year-Old Reading Level** - Simplified language for immediate comprehension (3-5 seconds)
- **Concrete Outcomes** - Replaced "grow your business" with "win more jobs" for specificity
- **Visual Hierarchy** - Applied emerald gradients to key selling points: languages, speed, outcomes
- **Trust Indicators** - Added professional trust signals below CTA: "7 Days Free | No Credit Card Required | Cancel Anytime"

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

### ✅ Complete Mobile-Friendly Authentication System (August 2025)
- **Dual Authentication Methods** - OAuth + email/password for same user account
- **Mobile Password Creation Flow** - Complete 4-step verification process for OAuth users
- **Smart Navigation** - Proper getUser() implementation following Supabase best practices  
- **Professional Email Templates** - Secure 24-hour token system with branded verification emails
- **Smooth User Experience** - Eliminated artificial delays and multi-step redirects
- **Logout Bug Fix** - Fixed automatic sign-in loop after logout with proper parameter handling
- **Settings Access** - Added Account Settings button to user profile dropdown
- **Category Animation Improvements** - Smoother staggered fade-in timing (150ms delay, 500ms duration)

### ✅ Email Template Redesign for Mobile Compatibility (August 2025)
- **White Background Compatibility** - Fixed email rendering issues on mobile clients that default to white
- **Dancing Script Font** - Updated logo font from Brush Script to Dancing Script to match website
- **Color Scheme Overhaul** - Changed from dark theme to light theme for universal compatibility
- **Improved Contrast** - Darker green shades (#059669) for better readability on white backgrounds
- **Professional Styling** - Light gray backgrounds (#f9fafb) with subtle borders for feature boxes
- **Mobile-First Design** - All text colors optimized for readability across all email clients

### ✅ Hero Section Updates (August 9, 2025)
- **Title** - "Specialized AI For Landscapers" with typewriter animation
- **New Subtitle** - "Upsell more services. Improve online visibility. Make smarter business decisions—all with AI Sidekick"
- **Typography Refinements** - Bold keywords, tighter line height (leading-snug), "AI Sidekick" 15% larger with letter spacing
- **Custom Gradient** - "AI Sidekick" uses emerald gradient (300-600) with Dancing Script font
- **Individual Card Animations** - Hero feature cards animate individually with 200ms staggered delays
- **Professional Polish** - Removed em dash spacing, optimized readability across all breakpoints

### ✅ Google Places API Optimization (August 2025)
- **Intelligent Competitor Detection** - New module reduces unnecessary API calls by 60-70%
- **Smart Intent Analysis** - Only triggers on explicit competitor/market research queries
- **Negative Pattern Filtering** - Skips how-to questions, internal operations, and general advice
- **Context-Based Triggering** - Requires multiple indicators (business + location + comparison terms)
- **Specialized Detection** - Identifies pricing comparison, service comparison, and market positioning intents
- **Cost Savings** - Combined with 24-hour caching, dramatically reduces API expenses

## Current Architecture

```
/app/landscaping                    # Main chat interface with consolidated tools
/app/admin/analytics               # Comprehensive business intelligence dashboard
/api/chat                          # OpenAI streaming with vector + web search + intent-aware routing
/api/images/generate              # DALL-E 3 inline generation
/api/files/process                # Multi-format file analysis
/api/admin/analytics              # Real-time business metrics API
/lib/chat-enhancements/           # Google APIs and intelligence modules
/lib/chat-enhancements/competitorDetection.ts  # Smart competitor intent detection
/lib/geocoding.ts                 # Dynamic ZIP→lat/lng persistence system
/lib/moderation.ts                # Content filtering across all inputs
/supabase/migrations/             # Database schema with coordinate columns
```

## Authentication & Signup Process

### Current Implementation:
- **Dual Authentication** - Google OAuth + Email/Password options
- **Email Verification Required** - 24-hour token system for email signups
- **Signup Flow**: `/signup` → Email verification → `/signup/complete` (profile completion)
- **Free Trial Setup** - Automatic 7-day trial with 250,000 tokens
- **Industry Standards** - Password hashing, minimum requirements, confirmation field
- **Professional Emails** - Branded verification emails with mobile-optimized templates

## Web Search Architecture

### Google Places API (Local Competitors):
- **Smart Triggering** - Only activates on competitor/market research intent (60-70% reduction in calls)
- **Dynamic Location Bias** - Real-time geocoding with 50km radius targeting for accurate nationwide results
- **Rating-Based Sorting** - Results sorted by rating then review count (highest first)
- **De-duplication** - Eliminates duplicate business listings by name
- **Enhanced Caching** - 24-hour cache with coordinate-based keys (query|zip|lat|lng|radius)
- **Returns** - Up to 10 unique, highest-rated local businesses

### Google Custom Search API (Web Intelligence):
- **Toggle Required** - User must enable web search in UI
- **Smart Date Filtering** - Dynamic restrictions (trends=90 days, regulatory=2 years, default=1 year)
- **Enhanced Parameters** - Sort by date, geo-targeting (gl=us), language filtering (lr=lang_en)
- **Domain Filtering** - Focuses on landscaping-specific sites (landscapenetwork.com, etc.)
- **24-Hour Caching** - Search-type aware cache keys for optimal freshness

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
- **Core Platform** - Chat, tools, authentication, file processing with XSS protection
- **Google Integrations** - Places API + Custom Search with enhanced caching + OAuth 2.0 authentication
- **Complete Analytics** - Real-time business intelligence with comprehensive API cost tracking
- **Professional UI** - Hero section redesigned with demo video and testimonials for business trust
- **Enterprise Security** - XSS prevention, zero secret logging, service role isolation, RLS enabled
- **Dynamic Location System** - Real-time geocoding with coordinate persistence for nationwide accuracy
- **Intent-Aware AI** - Production temperature routing for business-appropriate responses
- **Mobile Optimization** - Responsive design, touch interactions, video auto-play optimization
- **Performance Optimization** - Smart caching, model routing, enhanced API efficiency

### 🧪 TESTING REQUIRED (August 2025)
- **Mobile signup functionality** - Complete flow needs mobile device testing  
- **Password creation flow** - Email verification and password setup on mobile
- **Cross-device authentication** - Google on desktop, email/password on mobile
- **Logout functionality** - Verify fixed logout loop on all devices

### 🧪 TESTING CHECKLIST (Post-Security Update)

#### Authentication & Security Testing
1. **Password Migration** - Test that existing users can still log in (SHA-256 → bcrypt migration)
2. **New User Signup** - Create a new account and verify bcrypt password is used
3. **Admin Panel Access** - Verify only admin@ai-sidekick.io can access /admin/analytics
4. **Non-Admin Test** - Try accessing admin panel from a regular user account (should redirect to login)

#### Core Functionality Testing
1. **Chat Features** - Test all tools (web search, file upload, image generation)
2. **Cost Tracking** - Verify API costs are being tracked in admin dashboard
3. **User Data Isolation** - Ensure users can only see their own conversations
4. **Email Verification** - Test signup flow with email verification

#### Analytics Dashboard Testing
1. **Overview Tab** - Verify metrics display correctly
2. **Costs Tab** - Check all API cost breakdowns work
3. **Admin Usage Tab** - Confirm admin costs are separated
4. **Users/Insights Tabs** - Verify empty states display properly

#### Mobile Testing
1. **Responsive Design** - Test on actual mobile devices
2. **Chat Interface** - Verify tools dropdown works on mobile
3. **Authentication** - Test login/signup on mobile browsers

### 🎯 PRE-LAUNCH CHECKLIST (Final Items)

#### Critical Launch Items
1. ✅ **Production Domain Setup** - Environment variables already point to ai-sidekick.io
2. ✅ **Email Templates & Flow Redesign** - Professional email templates implemented with proper styling
   - Updated to light theme for compatibility with white email backgrounds
   - Changed logo font to Dancing Script to match website branding
   - Adjusted all colors for optimal readability on mobile email clients
   - Fixed contrast issues with darker green shades (#059669)
   - Unsubscribe page styling still needs updates
3. ✅ **API Rate Limiting** - Already implemented with user limits (20 daily images, 100 monthly) and OpenAI rate handling
4. **Production Error Monitoring** - Will add Sentry for user error tracking after market validation

#### Polish & Performance  
5. ✅ **Mobile category flashing** - Fixed page load flashing on chat tools
6. ✅ **Learn page mobile width** - Optimized /learn page for mobile devices
7. **Performance audit** - Optional: Lighthouse optimization and Core Web Vitals (can be done post-launch)

#### Growth & Monetization
8. **Subscription Management Features** - Will implement after market validation:
   - Subscription status display in account settings
   - Stripe integration for payment processing  
   - Upgrade/cancel subscription functionality
   - Billing history and invoice management
9. **User onboarding** - Guided tutorial for new users (post-launch optimization)

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

#### Asset Optimization & Video Hosting
- **Video Hosting Migration** - Currently storing 56MB+ videos in git repo (demo-video-get-started.mp4)
  - **Recommended: Cloudflare R2** - Free tier covers 10GB monthly, fast global CDN
  - **Alternative: AWS S3** - Very cheap (~$0.023 per GB), industry standard
  - **Current status:** Working fine in repo but causes large git clone/deployment times
  - **Action needed:** Move video assets to cloud storage when convenient
- **Image Optimization** - Consider cloud storage for large marketing images and comparison screenshots

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

## Chat Enhancement Package (Implemented July-August 2025)

### Enhanced Features Added:
- **Dynamic Image Analysis** - Context-aware prompts based on user intent and file type
- **Google Places API Caching** - 24-hour Supabase cache reducing API costs ~80%
- **Intelligent Competitor Detection** - Smart triggering reduces unnecessary Places API calls by 60-70%
- **System Prompt Enforcement** - Flexible, creative responses with consistent formatting
- **Professional Table Styling** - Emerald green headers, proper borders, mobile-optimized
- **Increased Results** - Google Places now shows up to 10 results (increased from 3-6)

### Key Files:
- `/lib/chat-enhancements/` - Modular enhancement functions
- `/lib/chat-enhancements/competitorDetection.ts` - Intelligent API trigger logic
- `/app/api/chat/route.ts` - Integration with chat API
- `/supabase-migrations/places_cache_table.sql` - Caching infrastructure
- `/supabase-migrations/web_search_cache_table.sql` - Web search caching

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

*Last updated: August 14, 2025 - Comprehensive Chat Stack Security Audit & Performance Enhancements*