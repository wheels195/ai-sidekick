const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteUser(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // First, find the user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, business_name')
      .eq('email', email)
      .single()
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('❌ User not found in user_profiles table')
        return
      }
      throw profileError
    }
    
    if (!profile) {
      console.log('❌ User not found')
      return
    }
    
    console.log('📋 User found:')
    console.log(`   ID: ${profile.id}`)
    console.log(`   Name: ${profile.first_name} ${profile.last_name}`)
    console.log(`   Business: ${profile.business_name}`)
    console.log(`   Email: ${profile.email}`)
    
    // Delete from user_profiles table first
    console.log('\n🗑️ Deleting user profile...')
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', profile.id)
    
    if (deleteProfileError) {
      throw deleteProfileError
    }
    
    console.log('✅ User profile deleted')
    
    // Delete from Supabase Auth
    console.log('🗑️ Deleting from Supabase Auth...')
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(profile.id)
    
    if (deleteAuthError) {
      console.warn('⚠️ Auth deletion warning:', deleteAuthError.message)
      // Continue anyway - profile is deleted
    } else {
      console.log('✅ User deleted from Supabase Auth')
    }
    
    // Clean up related data
    console.log('🧹 Cleaning up related data...')
    
    // Delete conversations
    const { error: conversationsError } = await supabase
      .from('user_conversations')
      .delete()
      .eq('user_id', profile.id)
    
    if (conversationsError) {
      console.warn('⚠️ Conversations cleanup warning:', conversationsError.message)
    } else {
      console.log('✅ User conversations deleted')
    }
    
    // Delete API usage tracking
    const { error: apiUsageError } = await supabase
      .from('api_usage_tracking')
      .delete()
      .eq('user_id', profile.id)
    
    if (apiUsageError) {
      console.warn('⚠️ API usage cleanup warning:', apiUsageError.message)
    } else {
      console.log('✅ API usage tracking deleted')
    }
    
    console.log(`\n🎉 User ${email} has been completely deleted!`)
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message)
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('Usage: node delete-user.js <email>')
  process.exit(1)
}

deleteUser(email)