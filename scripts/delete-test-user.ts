import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check .env.local')
  process.exit(1)
}

async function deleteTestUser() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const testEmail = 'wheelerm295@gmail.com'
  
  try {
    // First, get the user from user_profiles to get the ID
    const { data: profile, error: profileFetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', testEmail)
      .single()
    
    if (profileFetchError) {
      console.log('User profile not found:', profileFetchError)
    } else if (profile) {
      console.log('Found user profile with ID:', profile.id)
      
      // Delete from user_profiles table
      const { error: profileDeleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profile.id)
      
      if (profileDeleteError) {
        console.error('Error deleting profile:', profileDeleteError)
      } else {
        console.log('✓ Deleted from user_profiles')
      }
      
      // Delete from Supabase Auth
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(profile.id)
      
      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError)
      } else {
        console.log('✓ Deleted from auth.users')
      }
    }
    
    // Also try to delete by email directly from auth in case profile doesn't exist
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (!listError && users) {
      const authUser = users.find(u => u.email === testEmail)
      if (authUser) {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUser.id)
        if (!authDeleteError) {
          console.log('✓ Deleted auth user by email search')
        }
      }
    }
    
    console.log('\n✅ User deletion complete for:', testEmail)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the deletion
deleteTestUser()