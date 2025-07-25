"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, ChevronDown, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Multi-Select Dropdown Component
interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  disabled?: boolean
}

function MultiSelect({ options, value, onChange, placeholder, disabled }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.multi-select-container')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const handleRemoveOption = (option: string) => {
    onChange(value.filter(v => v !== option))
  }

  return (
    <div className="relative multi-select-container">
      <div
        className="bg-white/5 border border-white/20 text-blue-200 focus:border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 rounded-md px-3 py-2 cursor-pointer flex items-center justify-between min-h-10"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            value.map((item) => (
              <span
                key={item}
                className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                {item}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveOption(item)
                  }}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              className={`px-3 py-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${
                value.includes(option)
                  ? 'bg-blue-700 text-blue-200'
                  : 'text-white hover:bg-blue-700 hover:text-blue-200'
              }`}
              onClick={() => handleToggleOption(option)}
            >
              <span>{option}</span>
              {value.includes(option) && (
                <CheckCircle className="w-4 h-4 text-blue-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
    businessPriorities: [] as string[]
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
        'advanced': 'Advanced AI',
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
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          businessName: user.businessName || '',
          location: user.location || '',
          trade: user.trade || 'landscaping',
          services: user.services || [],
          teamSize: user.teamSize?.toString() || '',
          targetCustomers: user.targetCustomers || '',
          yearsInBusiness: user.yearsInBusiness?.toString() || '',
          businessPriorities: user.businessPriorities || []
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

  const handleServicesChange = (services: string[]) => {
    setFormData(prev => ({ ...prev, services }))
  }

  const handleBusinessPrioritiesChange = (priorities: string[]) => {
    setFormData(prev => ({ ...prev, businessPriorities: priorities }))
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
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'

      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    } else {
      // For upgrade mode, still require names if they're not provided
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
    }

    if (!formData.businessName) newErrors.businessName = 'Business name is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required'
    if (!formData.teamSize) newErrors.teamSize = 'Team size is required'
    if (!formData.yearsInBusiness) newErrors.yearsInBusiness = 'Years in business is required'
    if (!formData.services || formData.services.length === 0) newErrors.services = 'Please select at least one service'
    if (!formData.targetCustomers) newErrors.targetCustomers = 'Primary target customers is required'
    if (!formData.businessPriorities || formData.businessPriorities.length === 0) newErrors.businessPriorities = 'Please select at least one business priority'
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
        firstName: formData.firstName,
        lastName: formData.lastName,
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
          business_priorities: formData.businessPriorities
        }
      } : {
        firstName: formData.firstName,
        lastName: formData.lastName,
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
          business_priorities: formData.businessPriorities
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
                <ArrowLeft className="w-5 h-5 mr-2 md:hidden" />
                <span className="md:hidden">Home</span>
                <span className="hidden md:inline">Back to Home</span>
              </Button>
            </div>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = "/")}>
              <div className="w-10 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
                <p className="text-xs text-gray-300">Specialized AI for Local Trades</p>
              </div>
              <div className="md:hidden">
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          type="text"
                          name="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                          disabled={isLoading}
                        />
                        {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Input
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                          disabled={isLoading}
                        />
                        {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

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

                {/* Personal Information for Upgrade Mode */}
                {isUpgradeMode && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          type="text"
                          name="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                          disabled={isLoading}
                        />
                        {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Input
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                          disabled={isLoading}
                        />
                        {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                      </div>
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
                            formData.selectedPlan === 'Advanced AI' ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5'
                          }`}>
                            <input
                              type="radio"
                              name="selectedPlan"
                              value="Advanced AI"
                              checked={formData.selectedPlan === 'Advanced AI'}
                              onChange={(e) => setFormData(prev => ({ ...prev, selectedPlan: e.target.value }))}
                              className="sr-only"
                            />
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-semibold">Advanced AI - 59/month</div>
                                <div className="text-gray-400 text-sm">Full access with web search, priority support</div>
                              </div>
                              {formData.selectedPlan === 'Advanced AI' && <span className="text-blue-400 text-sm">✓ Selected</span>}
                            </div>
                          </label>
                          
                          <label className={`cursor-pointer border rounded-lg p-4 transition-all ${
                            formData.selectedPlan === 'Sidepiece AI' ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5'
                          }`}>
                            <input
                              type="radio"
                              name="selectedPlan"
                              value="Sidepiece AI"
                              checked={formData.selectedPlan === 'Sidepiece AI'}
                              onChange={(e) => setFormData(prev => ({ ...prev, selectedPlan: e.target.value }))}
                              className="sr-only"
                            />
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-semibold">Sidepiece AI - Contact Us</div>
                                <div className="text-gray-400 text-sm">Access to all trade AIs, premium features</div>
                              </div>
                              {formData.selectedPlan === 'Sidepiece AI' && <span className="text-blue-400 text-sm">✓ Selected</span>}
                            </div>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white opacity-75">
                          <div className="flex items-center justify-between">
                            <span>Free Trial - 0 (7 days)</span>
                            <span className="text-emerald-400 text-sm">✓ Selected</span>
                          </div>
                        </div>
                        
                        {/* Show grayed out paid options for context */}
                        <div className="space-y-2 opacity-40">
                          <div className="bg-gray-700/30 border border-gray-600/30 rounded-md px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Advanced AI - 59/month</span>
                              <span className="text-gray-500 text-sm">Available after trial</span>
                            </div>
                          </div>
                          <div className="bg-gray-700/30 border border-gray-600/30 rounded-md px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Sidepiece AI - Contact Us</span>
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
                        <SelectTrigger className="bg-white/5 border-white/20 text-blue-200 focus:border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
                          <SelectValue placeholder="Select team size *" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {teamSizeOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-blue-700 hover:text-blue-200 transition-all duration-300">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.teamSize && <p className="text-red-400 text-sm mt-1">{errors.teamSize}</p>}
                    </div>
                    <div>
                      <p className="text-white text-sm mb-2">Years in business:</p>
                      <Select onValueChange={(value) => handleSelectChange('yearsInBusiness', value)} value={formData.yearsInBusiness}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-blue-200 focus:border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
                          <SelectValue placeholder="Select experience *" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {yearsInBusinessOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-blue-700 hover:text-blue-200 transition-all duration-300">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.yearsInBusiness && <p className="text-red-400 text-sm mt-1">{errors.yearsInBusiness}</p>}
                    </div>
                  </div>

                  {/* Services Selection */}
                  {formData.trade && (
                    <div>
                      <p className="text-white text-sm mb-2">Services you offer (select all that apply) *:</p>
                      <MultiSelect
                        options={getServicesForTrade()}
                        value={formData.services}
                        onChange={handleServicesChange}
                        placeholder="Select your services *"
                        disabled={isLoading}
                      />
                      {errors.services && <p className="text-red-400 text-sm mt-1">{errors.services}</p>}
                    </div>
                  )}

                  {/* Target Customers */}
                  <div>
                    <p className="text-white text-sm mb-2">Primary target customers *:</p>
                    <Select onValueChange={(value) => handleSelectChange('targetCustomers', value)} value={formData.targetCustomers}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
                        <SelectValue placeholder="Select your main customer type *" className="text-blue-200" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {targetCustomerOptions.map((option) => (
                          <SelectItem key={option} value={option} className="text-white hover:bg-blue-700 hover:text-blue-200 transition-all duration-300">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.targetCustomers && <p className="text-red-400 text-sm mt-1">{errors.targetCustomers}</p>}
                  </div>

                  {/* Business Goals */}
                  <div>
                    <p className="text-white text-sm mb-2">Top business priorities (select all that apply) *:</p>
                    <MultiSelect
                      options={businessGoalsOptions}
                      value={formData.businessPriorities}
                      onChange={handleBusinessPrioritiesChange}
                      placeholder="Select your business goals *"
                      disabled={isLoading}
                    />
                    {errors.businessPriorities && <p className="text-red-400 text-sm mt-1">{errors.businessPriorities}</p>}
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