# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Sidekick is a Next.js 15 application that provides specialized AI assistants for local trade businesses. The app uses modern React with TypeScript, Tailwind CSS, and Radix UI components.

**Current Status:** Frontend MVP complete (v0 generated), OpenAI integration implemented and functional

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
1. **Landing Page** - Modern gradient design with responsive layout
2. **Chat Interface** - Located at `/landscaping` route with OpenAI integration
3. **OpenAI API Integration** - Real-time AI responses with specialized landscaping prompts
4. **Component Library** - Full shadcn/ui implementation
5. **Responsive Design** - Mobile-first approach with Tailwind breakpoints

## Backend Integration Status

### Completed
- **`/api/chat`** - OpenAI GPT-4o-mini integration with specialized landscaping system prompts
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
# Required (Implemented)
OPENAI_API_KEY=your_openai_api_key_here

# Optional (Configured)
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,.pdf,.doc,.docx,.txt

# Future (Supabase Integration)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Development Guidelines

### Styling Conventions
- Use Tailwind CSS classes exclusively
- **Typography**: Inter font loaded via Next.js fonts and configured as default sans-serif
- Follow existing gradient patterns (`from-blue-500 via-indigo-500 to-purple-500`)
- Maintain consistent spacing and responsive breakpoints
- Use backdrop-blur effects for glass morphism

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

- **No Generic Business Logic:** All AI responses must be trade-specific
- **File Processing:** Image analysis and document processing capabilities planned
- **Learning System:** Two-layer learning (global + individual user)
- **Security:** No sensitive data in client-side code
- **Accessibility:** Radix UI ensures WCAG compliance

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

## Testing Strategy

No test framework currently implemented. When adding tests:
- Use Jest for unit tests
- Consider Playwright for E2E testing
- Test both frontend components and API endpoints
- Verify file upload/processing workflows