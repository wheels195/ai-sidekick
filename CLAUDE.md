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

### ✅ Consolidated Tools Dropdown System
- **Upward-opening Tools dropdown** with Wrench icon (replaced individual buttons)
- **Green pill indicators** for active tools with X close buttons
- **Custom themed tooltip** "Choose tool" matching app design
- **Mobile-optimized** responsive design with touch-friendly targets
- **Inline image generation** (removed modal-based approach)
- **Smart state management** - only one tool active at a time
- **Fixed React error #418** and API 500 errors

### ✅ Core Features Implemented
1. **Chat Interface** - Full-screen experience with auto-expanding textarea
2. **OpenAI Integration** - GPT-4o/GPT-4o-mini with smart model routing
3. **Vector Database** - 501-line landscaping knowledge + user file storage
4. **File Processing** - Multi-format upload (PDF, images, docs) with AI analysis
5. **Web Search** - Google Places API for competitor research
6. **Authentication** - JWT + email verification + protected routes
7. **Cost Tracking** - Real-time API usage monitoring and analytics
8. **Mobile Optimization** - Universal responsive design across devices

### ✅ Business Intelligence System
- **Hardcoded Challenges** - 20 landscaping industry challenges auto-applied
- **Mandatory Signup Data** - Business profile, team size, services, priorities
- **Professional Email Flow** - Verification → Welcome emails with personalized content
- **Admin Analytics** - Real-time conversion tracking and user value monitoring

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

## Immediate Next Steps

### High Priority UX Improvements
1. **Enhanced Tool Animations** - Smooth transitions for dropdown open/close
2. **Tool Usage Analytics** - Track which tools users engage with most
3. **Keyboard Shortcuts** - Power user shortcuts for tool activation
4. **File Upload Progress** - Visual feedback during processing
5. **Image Generation History** - Gallery view of user's generated images

### Business Growth Features
1. **Competitor Analysis Templates** - Pre-built analysis frameworks
2. **Seasonal Campaign Builder** - Automated marketing calendar generation
3. **ROI Calculator Integration** - Business impact metrics for strategies
4. **Team Collaboration Tools** - Share conversations and insights
5. **Advanced Search Filters** - Filter vector knowledge by category/date

### Technical Optimizations
1. **Performance Monitoring** - Add Sentry error tracking
2. **A/B Testing Framework** - Test UI variations and messaging
3. **Database Query Optimization** - Improve vector search performance
4. **API Rate Limiting** - Protect against abuse and manage costs
5. **Backup & Recovery** - Automated data protection systems

## Testing Priorities

- **End-to-end user flow** - Signup → verification → tool usage → image generation
- **Mobile experience** - All tools dropdown functionality on various devices
- **File upload reliability** - Multi-format processing and error handling
- **Cost tracking accuracy** - Verify token counting and model usage analytics

## Market Launch Readiness

The platform is production-ready with:
- ✅ Professional domain and email system
- ✅ Complete user authentication and data collection
- ✅ Advanced AI capabilities with cost management
- ✅ Mobile-optimized responsive design
- ✅ Business intelligence and analytics systems

**Target:** Ready for customer acquisition and growth optimization.

## Development Guidelines

- **Mobile-first design** - All new features must work perfectly on mobile
- **Cost consciousness** - Monitor token usage and API costs for all features
- **User feedback integration** - Use analytics to guide feature priorities
- **Security focus** - All user data protected with proper authentication
- **Performance optimization** - Fast loading and responsive interactions

---

*Last updated: January 2025 - Consolidated Tools Dropdown Implementation*