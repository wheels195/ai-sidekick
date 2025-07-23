import { getServerUserProfile } from '@/lib/server-auth'
import { redirect } from 'next/navigation'
import LandscapingChatClient from './client-page'

export default async function LandscapingChatPage() {
  // Load user data server-side
  const user = await getServerUserProfile()
  
  // TEMPORARILY DISABLED FOR TESTING - Allow access without authentication
  if (!user) {
    // Use mock user data for testing
    const mockUser = {
      id: 'test-user-id',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'test@johnsonlandscaping.com',
      businessName: "Johnson's Landscaping",
      trade: 'landscaping',
      location: 'Dallas, TX',
      zipCode: '75201',
      services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation'],
      teamSize: 4,
      targetCustomers: 'residential homeowners',
      yearsInBusiness: 8,
      businessPriorities: ['finding new customers', 'pricing competition', 'seasonal cash flow'],
      tokensUsedTrial: 0,
      trialTokenLimit: 250000,
      hasConversationHistory: false // Treating as first-time user for testing
    }
    
    const initialGreeting = `<span class="text-white">Hi there! I'm </span><span class="font-cursive text-emerald-400 font-semibold text-lg">Dirt.i</span><span class="text-white">, your business AI sidekick. How can I help you today?</span>`

    return (
      <LandscapingChatClient 
        user={mockUser}
        initialGreeting={initialGreeting}
        isReturningUser={false}
      />
    )
  }

  // Determine appropriate greeting based on user history
  const isReturningUser = user.hasConversationHistory
  const displayName = user.firstName || 'there'
  
  const initialGreeting = isReturningUser
    ? `<span class="text-white">Hi ${displayName}! What are we working on today?</span>`
    : `<span class="text-white">Hi there! I'm </span><span class="font-cursive text-emerald-400 font-semibold text-lg">Dirt.i</span><span class="text-white">, your business AI sidekick. How can I help you today?</span>`

  // Pass user data and greeting to client component
  return (
    <LandscapingChatClient 
      user={user}
      initialGreeting={initialGreeting}
      isReturningUser={isReturningUser}
    />
  )
}