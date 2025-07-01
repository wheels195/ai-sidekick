# Supabase Setup Instructions

This guide helps you set up Supabase for user authentication and the two-layer learning system.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be set up (usually takes 2-3 minutes)

## 2. Get Your Project Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon/Public Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY) - keep this secret!

## 3. Update Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create all tables and policies

## 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. **Site URL**: Set to your domain (e.g., `http://localhost:3000` for development)
3. **Redirect URLs**: Add your domain + `/auth/callback`
4. Enable **Email confirmations** if desired
5. Configure **Email templates** under **Auth** → **Templates**

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. The chat should work without authentication (but won't store conversations)
3. Implement authentication UI to test user registration and login

## Database Schema Overview

### Core Tables

- **user_profiles**: Business information and context for personalization
- **user_conversations**: All chat messages with context and metadata
- **uploaded_files**: File storage and analysis results
- **global_conversations**: Anonymized data for system-wide learning
- **user_learning**: Individual user preferences and learning patterns
- **proven_strategies**: Knowledge base of successful strategies

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic timestamps**: Created/updated timestamps on relevant tables
- **Learning system**: Captures patterns for both individual and global improvement
- **Privacy protection**: User data is anonymized in global learning tables

## API Endpoints Created

- `POST /api/auth/signup` - User registration with business profile
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signout` - User logout
- `GET/PUT /api/user/profile` - User profile management
- `POST /api/chat` - Enhanced chat with conversation storage
- `POST /api/feedback` - Conversation feedback and learning

## Two-Layer Learning System

### Layer 1: Individual User Learning
- Stores all user conversations with business context
- Learns user preferences and communication styles
- Personalizes responses based on user's business profile

### Layer 2: Global Learning
- Anonymized patterns from all successful interactions
- Identifies what strategies work for different business types
- Improves system-wide knowledge base

## Security Notes

- All user data is protected by Row Level Security
- Service role key should never be exposed to the client
- User messages are hashed before storing in global learning
- Business context is anonymized (e.g., "Dallas" → "major_city")

## Next Steps

After setup, you can:
1. Build authentication UI components
2. Add user profile onboarding flow
3. Implement conversation history features
4. Add analytics and learning insights
5. Build admin dashboard for proven strategies management