import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Admin endpoint to check email campaign status
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get email campaign statistics
    const { data: campaigns, error } = await supabase
      .from('email_campaigns')
      .select('user_email, email_type, status, scheduled_for, sent_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Error fetching email campaigns:', error)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    // Get status summary
    const statusCounts = campaigns?.reduce((acc: any, campaign) => {
      acc[campaign.status] = (acc[campaign.status] || 0) + 1
      return acc
    }, {}) || {}

    // Get email type summary
    const typeCounts = campaigns?.reduce((acc: any, campaign) => {
      acc[campaign.email_type] = (acc[campaign.email_type] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      summary: {
        total: campaigns?.length || 0,
        statusCounts,
        typeCounts
      },
      campaigns: campaigns?.slice(0, 20), // Return latest 20 for preview
      message: 'Email campaign status retrieved successfully'
    })

  } catch (error) {
    console.error('Email status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email status' },
      { status: 500 }
    )
  }
}