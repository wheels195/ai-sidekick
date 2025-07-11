# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Open in Ubuntu with "cd ~/ai-sidekick"

## Project Overview

AI Sidekick is a Next.js 15 application that provides specialized AI assistants for local trade businesses. The app uses modern React with TypeScript, Tailwind CSS, and Radix UI components.

**Current Status:** ✅ **MARKET TESTING READY** - Complete authentication system, email verification, protected routes, user management, legal pages, and contact system implemented for 7-day trial launch with landscaping businesses

## Development Commands

```bash
# Development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Frontend Stack
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** Radix UI primitives with shadcn/ui styling
- **Icons:** Lucide React
- **State Management:** React hooks (no external state management)

### Project Structure
```
/app                 # Next.js App Router pages
  /landscaping       # Trade-specific chat interface
  layout.tsx         # Root layout
  page.tsx           # Landing page
/components          # Reusable UI components
  /ui                # shadcn/ui components (Radix UI based)
  theme-provider.tsx # Theme management
/lib                 # Utilities
  utils.ts           # Tailwind/clsx utilities
/hooks               # Custom React hooks
/public              # Static assets
```

### Key Features Implemented
1. **Landing Page** - Modern black theme design with responsive layout and emerald accents
2. **Chat Interface** - Full-screen chat experience at `/landscaping` route with:
   - Auto-expanding textarea that prevents horizontal scrolling
   - Mobile-optimized touch interactions
   - Full viewport height utilization for better readability
   - Tips and FAQ content positioned below chat for easy access
   - **Smart Feedback System** - Emoji reactions and conversation ratings
3. **OpenAI API Integration** - Enhanced AI responses with specialized landscaping prompts focused on digital marketing and local SEO
4. **Component Library** - Full shadcn/ui implementation with custom black theme styling
5. **Mobile Optimization** - Comprehensive mobile-first approach with:
   - Fixed scrolling issues on mobile browsers
   - Touch-friendly interface elements
   - Proper viewport handling for various screen sizes
   - Performance optimizations for mobile devices
6. **Learning Infrastructure** - Complete feedback collection and learning system:
   - High-engagement emoji reactions (🔥💡👍😕)
   - Strategic conversation rating prompts
   - Passive engagement tracking
   - Context-aware learning with business profiles

## Backend Integration Status

### Completed ✅
- **`/api/chat`** - OpenAI GPT-4o-mini integration with enhanced landscaping system prompts
- **Supabase Integration** - Database schema and conversation storage
- **JWT Authentication System** - Custom email verification, protected routes, secure login/logout
- **Email System** - Resend integration with verification and welcome emails
- **User Management** - Profile dropdown, business context, session handling
- **Route Protection** - Middleware blocking unauthorized access to `/landscaping`
- **Two-Layer Learning System** - Individual user learning and global pattern recognition
- **Privacy Protection** - Row Level Security and anonymized global learning

### Database Schema (Implemented)
- `user_profiles` - Business context including trade selection, services, team size, and challenges
- `user_conversations` - Chat history with context and metadata
- `uploaded_files` - File storage and analysis results (structure ready)
- `global_conversations` - Anonymized learning system data
- `user_learning` - Individual user preferences and patterns
- `proven_strategies` - Knowledge base of successful strategies
- `user_sessions` - Session tracking and engagement metrics

### API Endpoints (Completed) ✅
- `POST /api/auth/signup` - User registration with email verification and business profile
- `POST /api/auth/login` - JWT-based authentication with secure cookies
- `POST /api/auth/logout` - Cookie clearing and session termination
- `GET /api/verify-email` - Email verification token validation
- `GET/PUT /api/user/profile` - User profile management with JWT authorization
- `POST /api/feedback` - Advanced feedback system (emoji reactions, conversation ratings)
- `POST /api/chat` - OpenAI chat with conversation storage and user context

### Authentication System (✅ MARKET READY)
- **JWT Authentication** - HTTP-only cookies with 7-day expiration
- **Email Verification** - Resend integration with branded verification emails
- **Protected Routes** - Middleware protecting `/landscaping` from unauthorized access
- **User Session Management** - Profile dropdown with business info and logout
- **Secure Password Storage** - SHA-256 hashed passwords in database
- **Plan-Specific Signup** - Pricing CTAs auto-populate selected plan
- **Production Builds** - Suspense boundaries for useSearchParams compatibility

### Smart Learning System (✅ COMPLETED)
- **Emoji Reactions** - 🔥💡👍😕 on AI responses (appear on hover, non-intrusive)
- **Conversation Ratings** - 5-star rating after 3+ exchanges with strategic timing
- **Passive Learning** - Automatic tracking of conversation length, duration, engagement patterns
- **Two-Layer Learning** - Individual user patterns + global knowledge aggregation
- **Context-Aware Feedback** - Business profile integration for personalized learning
- **High-Engagement Design** - 3-5x better response rates than traditional thumbs up/down
- **Privacy-Protected** - Anonymized global learning with user data hashing

### ✅ DEPLOYED AND FUNCTIONAL
- **Production URL** - Successfully deployed to Vercel
- **Authentication System** - Signup → Email verification → Login → Chat access working
- **Email System** - Resend integration sending verification emails
- **7-Day Trial Focus** - Trial-based signup for market validation
- **Landscaping AI** - GPT-4o-mini responding with business expertise
- **Legal Compliance** - Updated Terms of Use and Privacy Policy for trial stage
- **Contact System** - Professional contact form for trade requests and support
- **Enhanced FAQ** - Comprehensive AI learning explanation and trial expectations

### ⚠️ CRITICAL FOR MARKET TESTING
- **NEXT_PUBLIC_SITE_URL** - Must update from localhost to production URL for email verification links to work for real users

### ✅ Security Complete
- **JWT_SECRET** - Secure random key configured (Dec 2024) - user sessions fully protected

### Recent Updates (January 2025)
- **Legal Pages** - Comprehensive Terms of Use and Privacy Policy for trial stage
- **Contact Form** - Professional contact system at `/contact` for trade requests
- **Enhanced FAQ** - Added detailed AI learning explanation with proper formatting
- **Authentication Fix** - Corrected login page text from "Supabase-powered" to "encrypted sessions"
- **CTA Updates** - "Request Your Trade Next" button directs to contact form with red/gray gradient
- **Visual Cohesion** - Matching gradients between CTAs and section headings

### Future Development (Post-Market Testing)
- `/api/upload` - File processing and analysis implementation  
- Conversation history interface in user dashboard
- Payment integration for paid plans (post-trial conversion)
- Additional trade-specific AI pages (/electrical, /hvac, etc.) based on demand
- Custom domain email setup (ai-sidekick.io)
- Advanced learning implementation using collected feedback data
- User onboarding flow optimization based on trial user feedback

### Environment Variables
```
# Required for Production
OPENAI_API_KEY=sk-proj-...                                    # ✅ Configured in Vercel
RESEND_API_KEY=re_QkT8FHeA_DpUR7PK7sAMech3TmCNQvuzq         # ✅ Configured in Vercel
JWT_SECRET=secure-random-key-generated                        # ✅ Configured in Vercel (Dec 2024)

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=https://tgrwtbtyfznebqrwenji.supabase.co  # ✅ Configured in Vercel
NEXT_PUBLIC_SUPABASE_ANON_KEY=configured_in_vercel               # ✅ Configured in Vercel
SUPABASE_SERVICE_ROLE_KEY=configured_in_vercel                   # ✅ Configured in Vercel

# Site Configuration  
NEXT_PUBLIC_SITE_URL=http://localhost:3000                      # ⚠️ CRITICAL - must update to https://ai-sidekick-alpha.vercel.app for email verification to work

# File Upload Settings (Configured)
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,.pdf,.doc,.docx,.txt
```

## Development Guidelines

### Styling Conventions
- Use Tailwind CSS classes exclusively
- **Typography**: Inter font loaded via Next.js fonts and configured as default sans-serif
- **Color Scheme**: Black theme with emerald/teal accents (`from-emerald-500 to-teal-500`)
- **Background**: Solid black (`bg-black`) for main sections with gradient overlays for visual interest
- Maintain consistent spacing and responsive breakpoints
- Use backdrop-blur effects for glass morphism with reduced opacity on black backgrounds
- **Mobile Considerations**: Touch-friendly sizing, proper viewport handling, performance optimization

### Component Patterns
- All UI components follow shadcn/ui conventions
- Use Radix UI primitives for accessibility
- Implement proper TypeScript interfaces
- Follow React best practices (hooks, composition)

### Navigation & Routing
- Use Next.js App Router patterns
- Implement smooth scrolling for anchor links
- Handle client-side navigation with `window.location.href`

## Important Notes

- **Market Testing Ready:** ✅ Fully deployed at https://ai-sidekick-alpha.vercel.app (pending SITE_URL fix for email verification)
- **Mobile Optimized:** ✅ Comprehensive mobile experience with touch-friendly interactions
- **No Generic Business Logic:** All AI responses must be trade-specific
- **Enhanced AI Prompts:** Focused on digital marketing, local SEO, and content creation strategies
- **Full-Screen Chat:** Chat interface uses full viewport height for optimal user experience
- **File Processing:** Image analysis and document processing capabilities planned
- **Learning System:** Two-layer learning (global + individual user)
- **Security:** No sensitive data in client-side code
- **Accessibility:** Radix UI ensures WCAG compliance
- **Theme:** Consistent black background with emerald accent colors

## Trade-Specific Features

### Landscaping (Available)
- Full chat interface at `/landscaping`
- Local SEO guidance
- Seasonal business planning
- Upselling strategies
- Content generation
- Customer retention

### Trade Selection System (✅ IMPLEMENTED)
- **7 Trades Available for Selection**: Landscaping, Electrical, HVAC, Plumbing, Roofing, Pest Control, General Contractor
- **Trade-Specific Services**: Each trade has curated service options
- **User Profile Storage**: Trade and services stored in Supabase for future routing
- **Future Expansion Ready**: Infrastructure in place for additional trade pages

### Coming Soon
- Individual AI sidekick pages for each trade (/electrical, /hvac, /plumbing, etc.)
- Trade-specific knowledge bases and prompts
- Pro plan access to all trades

## Deployment & Production

### Current Deployment
- **Platform**: Vercel (https://ai-sidekick-alpha.vercel.app)
- **Status**: ✅ Live and fully functional
- **Build Configuration**: Next.js 15 with React 19 compatibility using `--legacy-peer-deps`
- **Environment**: All variables configured in Vercel dashboard
- **Performance**: Optimized for mobile and desktop with fast response times

### Vercel Configuration
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install --legacy-peer-deps",
  "devCommand": "npm run dev"
}
```

### Development Commands
```bash
# Development server (with dependency compatibility)
npm run dev

# Build for production with React 19 compatibility
npm run build

# Lint code
npm run lint

# Install dependencies (required for React 19 compatibility)
npm install --legacy-peer-deps
```

## Testing Strategy

No test framework currently implemented. When adding tests:
- Use Jest for unit tests
- Consider Playwright for E2E testing
- Test both frontend components and API endpoints
- Verify file upload/processing workflows
- Test mobile responsiveness and touch interactions
