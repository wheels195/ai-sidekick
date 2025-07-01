# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Sidekick is a Next.js 15 application that provides specialized AI assistants for local trade businesses. The app uses modern React with TypeScript, Tailwind CSS, and Radix UI components.

**Current Status:** 🚀 **PRODUCTION DEPLOYED** - Full application live on Vercel with mobile optimization, black theme, and enhanced chat experience

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
3. **OpenAI API Integration** - Enhanced AI responses with specialized landscaping prompts focused on digital marketing and local SEO
4. **Component Library** - Full shadcn/ui implementation with custom black theme styling
5. **Mobile Optimization** - Comprehensive mobile-first approach with:
   - Fixed scrolling issues on mobile browsers
   - Touch-friendly interface elements
   - Proper viewport handling for various screen sizes
   - Performance optimizations for mobile devices

## Backend Integration Status

### Completed
- **`/api/chat`** - OpenAI GPT-4o-mini integration with enhanced landscaping system prompts focused on digital marketing, local SEO, and content creation
- **Supabase Integration** - Database schema, authentication, and conversation storage
- **Two-Layer Learning System** - Individual user learning and global pattern recognition
- **Authentication APIs** - Sign up, sign in, sign out, and profile management
- **Conversation Storage** - All chats stored with business context for personalization
- **Privacy Protection** - Row Level Security and anonymized global learning

### Database Schema (Implemented)
- `user_profiles` - Business context and preferences
- `user_conversations` - Chat history with context and metadata
- `uploaded_files` - File storage and analysis results (structure ready)
- `global_conversations` - Anonymized learning system data
- `user_learning` - Individual user preferences and patterns
- `proven_strategies` - Knowledge base of successful strategies
- `user_sessions` - Session tracking and engagement metrics

### API Endpoints (Completed)
- `POST /api/auth/signup` - User registration with business profile
- `POST /api/auth/signin` - User authentication  
- `POST /api/auth/signout` - User logout
- `GET/PUT /api/user/profile` - User profile management
- `POST /api/feedback` - Conversation feedback and learning

### Planned (Future Development)
- `/api/upload` - File processing and analysis implementation
- Authentication UI components
- User onboarding flow with business profile setup
- Conversation history interface
- Learning analytics dashboard

### Environment Variables
```
# Production Environment (Configured in Vercel)
OPENAI_API_KEY=configured_in_vercel

# Supabase Integration (Configured)
NEXT_PUBLIC_SUPABASE_URL=https://tgrwtbtyfznebqrwenji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=configured_in_vercel
SUPABASE_SERVICE_ROLE_KEY=configured_in_vercel

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

- **Production Ready:** ✅ Fully deployed and operational at https://ai-sidekick-alpha.vercel.app
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
- Local SEO guidance
- Seasonal business planning
- Upselling strategies
- Content generation
- Customer retention

### Coming Soon
- Electricians, HVAC, Plumbers, Roofers, Pest Control
- Each with industry-specific knowledge bases
- Pro plan provides access to all trades

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