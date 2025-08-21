import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  // Simple security check using URL parameter
  const { searchParams } = new URL(request.url)
  const authKey = searchParams.get('key')
  
  if (authKey !== 'hazel-fix-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createServiceClient()
  
  try {
    // Try to manually create the record using raw SQL
    const insertSQL = `
      INSERT INTO email_campaigns (user_email, email_type, scheduled_for, status, user_data)
      VALUES 
        ('topguncleaner@gmail.com', 'trial-day-1', NOW(), 'scheduled', '{"firstName": "Hazel"}'),
        ('topguncleaner@gmail.com', 'trial-day-2', NOW() + INTERVAL '1 day', 'scheduled', '{"firstName": "Hazel"}'),
        ('topguncleaner@gmail.com', 'trial-day-3', NOW() + INTERVAL '2 days', 'scheduled', '{"firstName": "Hazel"}'),
        ('topguncleaner@gmail.com', 'trial-day-4', NOW() + INTERVAL '3 days', 'scheduled', '{"firstName": "Hazel"}'),
        ('topguncleaner@gmail.com', 'trial-day-5', NOW() + INTERVAL '4 days', 'scheduled', '{"firstName": "Hazel"}'),
        ('topguncleaner@gmail.com', 'trial-day-6', NOW() + INTERVAL '5 days', 'scheduled', '{"firstName": "Hazel"}'),
        ('topguncleaner@gmail.com', 'trial-day-7', NOW() + INTERVAL '6 days', 'scheduled', '{"firstName": "Hazel"}')
    `
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: insertSQL })
    
    if (error) {
      console.error('SQL insert failed:', error)
      
      // Try using regular insert as fallback
      const emailsToSchedule = [
        {
          user_email: 'topguncleaner@gmail.com',
          email_type: 'trial-day-1',
          scheduled_for: new Date().toISOString(),
          status: 'scheduled',
          user_data: { firstName: 'Hazel' }
        },
        {
          user_email: 'topguncleaner@gmail.com',
          email_type: 'trial-day-2',
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          user_data: { firstName: 'Hazel' }
        },
        {
          user_email: 'topguncleaner@gmail.com',
          email_type: 'trial-day-3',
          scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          user_data: { firstName: 'Hazel' }
        },
        {
          user_email: 'topguncleaner@gmail.com',
          email_type: 'trial-day-4',
          scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          user_data: { firstName: 'Hazel' }
        },
        {
          user_email: 'topguncleaner@gmail.com',
          email_type: 'trial-day-5',
          scheduled_for: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          user_data: { firstName: 'Hazel' }
        },
        {
          user_email: 'topguncleaner@gmail.com',
          email_type: 'trial-day-6',
          scheduled_for: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          user_data: { firstName: 'Hazel' }
        },
        {
          user_email: 'topguncleaner@gmail.com',
          email_type: 'trial-day-7',
          scheduled_for: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          user_data: { firstName: 'Hazel' }
        }
      ]
      
      const { data: insertData, error: insertError } = await supabase
        .from('email_campaigns')
        .insert(emailsToSchedule)
        .select()
      
      if (insertError) {
        return NextResponse.json({ 
          error: 'Both SQL and regular insert failed', 
          sql_error: error.message,
          insert_error: insertError.message,
          table_missing: insertError.code === '42P01'
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Successfully scheduled 7 emails for Hazel using fallback method',
        emails_scheduled: insertData?.length || 7
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully scheduled 7 emails for Hazel using SQL',
      sql_result: data
    })
    
  } catch (error) {
    console.error('Error in simple Hazel fix:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error.message 
    }, { status: 500 })
  }
}