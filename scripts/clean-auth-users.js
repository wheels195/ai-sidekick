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

async function cleanOrphanedAuthUsers() {
  try {
    console.log('🔍 Checking for orphaned auth users...')
    
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      throw authError
    }
    
    console.log(`📊 Found ${authUsers.users.length} users in Supabase Auth`)
    
    // Check each auth user against user_profiles
    for (const authUser of authUsers.users) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', authUser.id)
        .single()
      
      if (profileError && profileError.code === 'PGRST116') {
        // User exists in auth but not in profiles (orphaned)
        console.log(`\n🧹 Found orphaned auth user:`)
        console.log(`   ID: ${authUser.id}`)
        console.log(`   Email: ${authUser.email}`)
        console.log(`   Created: ${authUser.created_at}`)
        
        // Check if this is the specific email we want to delete
        if (authUser.email === 'wheelerm295@gmail.com') {
          console.log(`🗑️ Deleting specific user: ${authUser.email}`)
          
          const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id)
          
          if (deleteError) {
            console.error(`❌ Failed to delete ${authUser.email}:`, deleteError.message)
          } else {
            console.log(`✅ Successfully deleted ${authUser.email}`)
          }
        } else {
          console.log(`⏭️ Skipping ${authUser.email} (not the target email)`)
        }
      }
    }
    
    console.log('\n🎉 Cleanup complete!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message)
    process.exit(1)
  }
}

cleanOrphanedAuthUsers()