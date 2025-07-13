"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    city: '',
    state: '',
    zipCode: '',
    trade: 'landscaping', // Pre-selected for landscaping trial
    selectedPlan: 'Free Trial', // Pre-selected for trial
    services: [] as string[],
    customService: '',
    teamSize: '',
    targetCustomers: '',
    yearsInBusiness: '',
    mainChallenges: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordsChecked, setPasswordsChecked] = useState(false)

  // Auto-populate plan from URL parameter and detect upgrade mode
  const [isUpgradeMode, setIsUpgradeMode] = useState(false)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const planParam = urlParams.get('plan')
    const upgradeParam = urlParams.get('upgrade')
    
    // Check if this is an upgrade from trial expiration
    if (upgradeParam === 'true') {
      setIsUpgradeMode(true)
      setFormData(prev => ({ ...prev, selectedPlan: 'Advanced Plan' })) // Default to Advanced for engaged users
      
      // Pre-populate existing user data for upgrade
      fetchExistingUserData()
    }
    
    if (planParam) {
      const planMap: Record<string, string> = {
        'free-trial': 'Free Trial',
        'starter': 'Starter Plan', 
        'advanced': 'Advanced Plan',
        'sidepiece-ai': 'Sidepiece AI'
      }
      const planName = planMap[planParam] || ''
      if (planName) {
        setFormData(prev => ({ ...prev, selectedPlan: planName }))
      }
    }
  }, [])

  // Fetch existing user data for upgrade flow
  const fetchExistingUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        // Pre-populate form with existing data
        setFormData(prev => ({
          ...prev,
          businessName: user.businessName || '',
          location: user.location || '',
          trade: user.trade || 'landscaping',
          services: user.services || [],
          teamSize: user.teamSize?.toString() || '',
          targetCustomers: user.targetCustomers || '',
          yearsInBusiness: user.yearsInBusiness?.toString() || '',
          mainChallenges: user.mainChallenges?.join(', ') || ''
        }))
        
        // Parse location into city/state if possible and add zip code
        if (user.location) {
          const locationParts = user.location.split(', ')
          if (locationParts.length >= 2) {
            setFormData(prev => ({
              ...prev,
              city: locationParts[0] || '',
              state: locationParts[1] || '',
              zipCode: user.zipCode || ''
            }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing user data:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePasswordBlur = () => {
    // Only show password matching indicators after both passwords have been entered and user moves away
    if (formData.password && formData.confirmPassword) {
      setPasswordsChecked(true)
    }
  }

  const getPasswordMatchStatus = () => {
    if (!passwordsChecked || !formData.password || !formData.confirmPassword) {
      return null
    }
    return formData.password === formData.confirmPassword
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleTargetCustomerToggle = (customer: string) => {
    // Convert targetCustomers to array if it's a string
    const currentCustomers = typeof formData.targetCustomers === 'string' 
      ? formData.targetCustomers.split(', ').filter(c => c) 
      : (Array.isArray(formData.targetCustomers) ? formData.targetCustomers : [])
    
    const updatedCustomers = currentCustomers.includes(customer)
      ? currentCustomers.filter(c => c !== customer)
      : [...currentCustomers, customer]
    
    setFormData(prev => ({ ...prev, targetCustomers: updatedCustomers.join(', ') }))
  }

  const handleBusinessGoalToggle = (goal: string) => {
    // Convert mainChallenges to array if it's a string
    const currentGoals = typeof formData.mainChallenges === 'string' 
      ? formData.mainChallenges.split(', ').filter(g => g) 
      : (Array.isArray(formData.mainChallenges) ? formData.mainChallenges : [])
    
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal]
    
    setFormData(prev => ({ ...prev, mainChallenges: updatedGoals.join(', ') }))
  }

  // Trade options and their corresponding services
  const tradeOptions = {
    landscaping: {
      name: 'Landscaping',
      services: [
        'Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation', 'Hardscaping', 
        'Snow Removal', 'Pest Control', 'Power Washing/Pressure Washing', 
        'Holiday & Christmas Lighting', 'Exterior/Landscape Lighting', 
        'Fence Installation & Repair', 'Outdoor Living Spaces', 
        'Mosquito Control', 'Leaf Removal', 'Mulching Services'
      ]
    },
    electrical: {
      name: 'Electrical',
      services: ['Residential Wiring', 'Commercial Electric', 'Panel Upgrades', 'Lighting Installation', 'Generator Installation', 'Emergency Repairs']
    },
    hvac: {
      name: 'HVAC',
      services: ['AC Installation', 'Heating Repair', 'Duct Cleaning', 'Maintenance Plans', 'Indoor Air Quality', 'Commercial HVAC']
    },
    plumbing: {
      name: 'Plumbing',
      services: ['Drain Cleaning', 'Pipe Repair', 'Water Heater Service', 'Bathroom Remodeling', 'Emergency Plumbing', 'Sewer Line']
    },
    roofing: {
      name: 'Roofing',
      services: ['Roof Replacement', 'Roof Repair', 'Gutter Installation', 'Storm Damage', 'Inspections', 'Commercial Roofing']
    },
    pest_control: {
      name: 'Pest Control',
      services: ['Monthly Service', 'One-Time Treatment', 'Termite Control', 'Rodent Control', 'Commercial Pest Control', 'Wildlife Removal']
    },
    general_contractor: {
      name: 'General Contractor',
      services: ['Home Remodeling', 'Kitchen Renovation', 'Bathroom Renovation', 'Additions', 'Commercial Construction', 'Handyman Services']
    }
  }

  const getServicesForTrade = () => {
    if (!formData.trade || !tradeOptions[formData.trade as keyof typeof tradeOptions]) {
      return []
    }
    return tradeOptions[formData.trade as keyof typeof tradeOptions].services
  }

  // Business dropdown options
  const teamSizeOptions = [
    'Solo (just me)',
    '2-3 employees', 
    '4-7 employees',
    '8-15 employees',
    '16+ employees'
  ]

  const yearsInBusinessOptions = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years', 
    '6-10 years',
    '11-20 years',
    '20+ years'
  ]

  const targetCustomerOptions = [
    'Residential homeowners',
    'Property management companies',
    'Commercial properties',
    'HOA communities',
    'New construction',
    'Municipal/government contracts'
  ]

  const businessGoalsOptions = [
    'Generate more qualified leads',
    'Improve local search rankings (SEO)',
    'Increase average job value',
    'Beat competitor pricing strategies', 
    'Scale operations & grow team',
    'Improve customer retention',
    'Streamline seasonal planning',
    'Enhance online reputation',
    'Expand service offerings',
    'Optimize pricing for profitability'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Skip email/password validation for upgrade mode
    if (!isUpgradeMode) {
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'

      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.businessName) newErrors.businessName = 'Business name is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required'
    // Trade and plan are pre-selected for landscaping trial

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Use upgrade endpoint for existing users, signup endpoint for new users
      const endpoint = isUpgradeMode ? '/api/auth/upgrade' : '/api/auth/signup'
      const requestBody = isUpgradeMode ? {
        selectedPlan: formData.selectedPlan,
        businessProfile: {
          business_name: formData.businessName,
          location: `${formData.city}, ${formData.state}`,
          zip_code: formData.zipCode,
          trade: formData.trade,
          services: formData.customService ? [...formData.services, formData.customService] : formData.services,
          team_size: formData.teamSize,
          target_customers: formData.targetCustomers,
          years_in_business: formData.yearsInBusiness,
          main_challenges: formData.mainChallenges ? formData.mainChallenges.split(',').map(s => s.trim()) : []
        }
      } : {
        email: formData.email,
        password: formData.password,
        selectedPlan: formData.selectedPlan,
        businessProfile: {
          business_name: formData.businessName,
          location: `${formData.city}, ${formData.state}`,
          zip_code: formData.zipCode,
          trade: formData.trade,
          services: formData.customService ? [...formData.services, formData.customService] : formData.services,
          team_size: formData.teamSize,
          target_customers: formData.targetCustomers,
          years_in_business: formData.yearsInBusiness,
          main_challenges: formData.mainChallenges ? formData.mainChallenges.split(',').map(s => s.trim()) : []
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        if (isUpgradeMode) {
          // Show success message for upgrade then redirect to chat
          alert(`🎉 ${data.message}\n\nYou can now continue chatting with unlimited access while we finalize payment processing. All your previous conversations and business data have been preserved.`)
        }
        
        // Success - redirect to appropriate trade page
        const tradePage = formData.trade === 'landscaping' ? '/landscaping' : '/landscaping' // Default to landscaping for now
        window.location.href = tradePage
      } else {
        setErrors({ submit: data.error || (isUpgradeMode ? 'Failed to upgrade account' : 'Failed to create account') })
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/35 to-indigo-500/35 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-3 py-2"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = "/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
                <p className="text-xs text-gray-300">Specialized AI for Local Trades</p>
              </div>
            </div>

            <div className="w-20"></div> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-6 py-3 mb-6 hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Get Started</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                {isUpgradeMode ? 'Upgrade Your Plan' : 'Create Your Account'}
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              {isUpgradeMode 
                ? 'Choose a plan to continue using AI Sidekick for your landscaping business'
                : 'Start your 7-day free trial for landscaping business growth'
              }
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">Landscaping Business Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Credentials - Only show for new signups */}
                {!isUpgradeMode && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Account Credentials</h3>
                    
                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                        disabled={isLoading}
                      />
                      {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password (6+ characters)"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handlePasswordBlur}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handlePasswordBlur}
                        className={`bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 pr-20 ${
                          getPasswordMatchStatus() === true ? 'border-green-500/50' : 
                          getPasswordMatchStatus() === false ? 'border-red-500/50' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {getPasswordMatchStatus() === true && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {getPasswordMatchStatus() === false && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                      {getPasswordMatchStatus() === true && (
                        <p className="text-green-400 text-sm mt-1">✓ Passwords match</p>
                      )}
                      {getPasswordMatchStatus() === false && (
                        <p className="text-red-400 text-sm mt-1">✗ Passwords don't match</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Business Details</h3>
                  
                  <div>
                    <Input
                      type="text"
                      name="businessName"
                      placeholder="Business name *"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                      disabled={isLoading}
                    />
                    {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
                  </div>

                  <div>
                    {isUpgradeMode ? (
                      <div className="space-y-3">
                        <p className="text-orange-400 text-sm font-medium">⚠️ Choose a paid plan to continue (Free trial already used)</p>
                        
                        <div className="grid gap-3">
                          <label className={`cursor-pointer border rounded-lg p-4 transition-all ${
                            formData.selectedPlan === 'Starter Plan' ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5'
                          }`}>
                            <input
                              type="radio"
                              name="selectedPlan"
                              value="Starter Plan"
                              checked={formData.selectedPlan === 'Starter Plan'}
                              onChange={(e) => setFormData(prev => ({ ...prev, selectedPlan: e.target.value }))}
                              className="sr-only"
                            />
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-semibold">Starter Plan - $29/month</div>
                                <div className="text-gray-400 text-sm">Unlimited tokens, basic support</div>
                              </div>
                              {formData.selectedPlan === 'Starter Plan' && <span className="text-blue-400 text-sm">✓ Selected</span>}
                            </div>
                          </label>
                          
                          <label className={`cursor-pointer border rounded-lg p-4 transition-all ${
                            formData.selectedPlan === 'Advanced Plan' ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5'
                          }`}>
                            <input
                              type="radio"
                              name="selectedPlan"
                              value="Advanced Plan"
                              checked={formData.selectedPlan === 'Advanced Plan'}
                              onChange={(e) => setFormData(prev => ({ ...prev, selectedPlan: e.target.value }))}
                              className="sr-only"
                            />
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-semibold">Advanced Plan - $59/month</div>
                                <div className="text-gray-400 text-sm">Everything + priority support, advanced features</div>
                              </div>
                              {formData.selectedPlan === 'Advanced Plan' && <span className="text-blue-400 text-sm">✓ Selected</span>}
                            </div>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white opacity-75">
                          <div className="flex items-center justify-between">
                            <span>Free Trial - $0 (7 days)</span>
                            <span className="text-emerald-400 text-sm">✓ Selected</span>
                          </div>
                        </div>
                        
                        {/* Show grayed out paid options for context */}
                        <div className="space-y-2 opacity-40">
                          <div className="bg-gray-700/30 border border-gray-600/30 rounded-md px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Starter Plan - $29/month</span>
                              <span className="text-gray-500 text-sm">Available after trial</span>
                            </div>
                          </div>
                          <div className="bg-gray-700/30 border border-gray-600/30 rounded-md px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Advanced Plan - $59/month</span>
                              <span className="text-gray-500 text-sm">Available after trial</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-xs mt-1">Currently only offering landscaping trials</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Input
                        type="text"
                        name="city"
                        placeholder="City *"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                        disabled={isLoading}
                      />
                      {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="state"
                        placeholder="State *"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                        disabled={isLoading}
                      />
                      {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="zipCode"
                        placeholder="ZIP Code *"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                        disabled={isLoading}
                      />
                      {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>

                  <div>
                    <div className="bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white opacity-75">
                      <div className="flex items-center justify-between">
                        <span>Landscaping</span>
                        <span className="text-emerald-400 text-sm">✓ Selected</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Market testing with landscaping businesses only</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white text-sm mb-2">Team size:</p>
                      <Select onValueChange={(value) => handleSelectChange('teamSize', value)} value={formData.teamSize}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-500/50">
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {teamSizeOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-white text-sm mb-2">Years in business:</p>
                      <Select onValueChange={(value) => handleSelectChange('yearsInBusiness', value)} value={formData.yearsInBusiness}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-500/50">
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {yearsInBusinessOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Services Selection */}
                  {formData.trade && (
                    <div>
                      <p className="text-white text-sm mb-3">Services you offer (select all that apply):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {getServicesForTrade().map((service) => (
                          <label
                            key={service}
                            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300"
                          >
                            <input
                              type="checkbox"
                              checked={formData.services.includes(service)}
                              onChange={() => handleServiceToggle(service)}
                              className="w-4 h-4 text-blue-500 bg-transparent border-gray-300 rounded focus:ring-blue-500"
                              disabled={isLoading}
                            />
                            <span className="text-gray-200 text-sm">{service}</span>
                          </label>
                        ))}
                      </div>
                      
                    </div>
                  )}

                  {/* Target Customers */}
                  <div>
                    <p className="text-white text-sm mb-3">Target customers (select all that apply):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {targetCustomerOptions.map((customer) => (
                        <label
                          key={customer}
                          className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                            formData.targetCustomers.split(', ').filter(c => c).includes(customer)
                              ? 'bg-blue-500/30 border-blue-500 text-blue-200 shadow-lg'
                              : 'bg-white/5 border-white/20 hover:bg-blue-500/10 hover:border-blue-500/30 text-gray-200 hover:text-blue-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.targetCustomers.split(', ').filter(c => c).includes(customer)}
                            onChange={() => handleTargetCustomerToggle(customer)}
                            className="w-4 h-4 text-blue-500 bg-transparent border-gray-300 rounded focus:ring-blue-500"
                            disabled={isLoading}
                          />
                          <span className={`text-sm font-medium ${
                            formData.targetCustomers.split(', ').filter(c => c).includes(customer)
                              ? 'text-blue-100 font-bold'
                              : ''
                          }`}>{customer}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Business Goals */}
                  <div>
                    <p className="text-white text-sm mb-3">Primary business goals (select all that apply):</p>
                    <div className="grid grid-cols-1 gap-3">
                      {businessGoalsOptions.map((goal) => (
                        <label
                          key={goal}
                          className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                            formData.mainChallenges.split(', ').filter(g => g).includes(goal)
                              ? 'bg-blue-500/30 border-blue-500 text-blue-200 shadow-lg'
                              : 'bg-white/5 border-white/20 hover:bg-blue-500/10 hover:border-blue-500/30 text-gray-200 hover:text-blue-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.mainChallenges.split(', ').filter(g => g).includes(goal)}
                            onChange={() => handleBusinessGoalToggle(goal)}
                            className="w-4 h-4 text-blue-500 bg-transparent border-gray-300 rounded focus:ring-blue-500"
                            disabled={isLoading}
                          />
                          <span className={`text-sm ${
                            formData.mainChallenges.split(', ').filter(g => g).includes(goal)
                              ? 'text-blue-100 font-bold'
                              : 'text-gray-200'
                          }`}>{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                    {errors.submit}
                  </div>
                )}

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>{isUpgradeMode ? 'Processing Upgrade...' : 'Creating Account...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>{isUpgradeMode ? 'Upgrade & Continue Chat' : 'Create Account & Start Chat'}</span>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => window.location.href = '/login'}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-emerald-400 hover:text-emerald-300 underline">
                terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                privacy policy
              </a>.
              <br />
              Your business information helps us provide personalized advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}