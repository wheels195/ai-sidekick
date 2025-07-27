import { getServerUserProfile } from '@/lib/server-auth'
import { redirect } from 'next/navigation'
import LandscapingChatClient from './client-page'

export default async function LandscapingChatPage() {
  // Load user data server-side
  const user = await getServerUserProfile()
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login?redirect=/landscaping')
  }

  // Determine appropriate greeting based on user history
  const isReturningUser = user.hasConversationHistory
  const displayName = user.firstName || 'there'
  
  const initialGreeting = isReturningUser
    ? `<span class="text-white">Hey ${displayName}! What are we working on today?</span>`
    : `<span class="text-white">Hey there! I'm </span><span class="font-cursive text-emerald-400 font-semibold text-lg">Sage</span><span class="text-white">, your business AI sidekick. How can I help you today?</span>`

  // Pass user data and greeting to client component
  return (
    <LandscapingChatClient 
      user={user}
      initialGreeting={initialGreeting}
      isReturningUser={isReturningUser}
    />
  )
}