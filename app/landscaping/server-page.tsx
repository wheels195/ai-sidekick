import { getServerUserProfile } from '@/lib/server-auth'
import { redirect } from 'next/navigation'
import LandscapingChatClient from './client-page'

export default async function LandscapingChatPage() {
  // Load user data server-side
  const user = await getServerUserProfile()
  
  // Handle different authentication states
  if (!user) {
    redirect('/login?redirect=/landscaping')
  }
  
  // Check if user is authenticated but needs to complete profile
  if ('needsProfileCompletion' in user) {
    redirect(`/signup/complete?email=${encodeURIComponent(user.userEmail)}`)
  }

  // TypeScript now knows user is a UserProfile, not ProfileCompletion
  const userProfile = user as Extract<typeof user, { id: string }>
  
  // Determine appropriate greeting based on user history
  const isReturningUser = userProfile.hasConversationHistory
  const displayName = userProfile.firstName || 'there'
  
  const initialGreeting = isReturningUser
    ? `<span class="text-white">Hey ${displayName}! What are we working on today?</span>`
    : `<span class="text-white">Hey there! I'm </span><span class="font-cursive text-emerald-400 font-semibold text-lg">Sonny</span><span class="text-white">, your business AI sidekick. How can I help you today?</span>`

  // Pass user data and greeting to client component
  return (
    <LandscapingChatClient 
      user={userProfile}
      initialGreeting={initialGreeting}
      isReturningUser={isReturningUser}
    />
  )
}