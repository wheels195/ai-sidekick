import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, email, business_name, trade, selected_plan, created_at, location, services, team_size, target_customers, years_in_business, main_challenges')
      .eq('id', user.userId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        businessName: profile.business_name,
        trade: profile.trade,
        selectedPlan: profile.selected_plan,
        createdAt: profile.created_at,
        location: profile.location,
        services: profile.services || [],
        teamSize: profile.team_size,
        targetCustomers: profile.target_customers,
        yearsInBusiness: profile.years_in_business,
        mainChallenges: profile.main_challenges || []
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    const profileData = await request.json()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        business_name: profileData.businessName,
        trade: profileData.trade,
        selected_plan: profileData.selectedPlan,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        businessName: data.business_name,
        trade: data.trade,
        selectedPlan: data.selected_plan
      },
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}