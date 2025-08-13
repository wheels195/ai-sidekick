"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, CheckCircle, ChevronDown, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase/client'

// Multi-Select Dropdown Component
interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  disabled?: boolean
  openUpward?: boolean
}

function MultiSelect({ options, value, onChange, placeholder, disabled, openUpward = false }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

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
        className="bg-white/5 border border-white/20 text-emerald-300 focus:border-emerald-500/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 rounded-md px-3 py-2 cursor-pointer flex items-center justify-between min-h-10"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            value.map((item) => (
              <span
                key={item}
                className="bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded text-xs flex items-center gap-1"
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
        <div className={`absolute z-50 w-full ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto`}>
          {options.map((option) => (
            <div
              key={option}
              className={`px-3 py-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${
                value.includes(option)
                  ? 'bg-emerald-700 text-emerald-200'
                  : 'text-white hover:bg-emerald-700 hover:text-emerald-200'
              }`}
              onClick={() => handleToggleOption(option)}
            >
              <span>{option}</span>
              {value.includes(option) && (
                <CheckCircle className="w-4 h-4 text-emerald-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Grouped Multi-Select Component
interface GroupedMultiSelectProps {
  groups: Record<string, string[]>
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  disabled?: boolean
  openUpward?: boolean
}

function GroupedMultiSelect({ groups, value, onChange, placeholder, disabled, openUpward = false }: GroupedMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

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
        className="bg-white/5 border border-white/20 text-emerald-300 focus:border-emerald-500/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 rounded-md px-3 py-2 cursor-pointer flex items-center justify-between min-h-10"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            value.map((item) => (
              <span
                key={item}
                className="bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded text-xs flex items-center gap-1"
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
        <div className={`absolute z-50 w-full ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto`}>
          {Object.entries(groups).map(([groupName, options]) => (
            <div key={groupName}>
              <div className="px-3 py-2 bg-gray-700 text-emerald-300 font-semibold text-sm border-b border-gray-600">
                {groupName}
              </div>
              {options.map((option) => (
                <div
                  key={option}
                  className={`px-3 py-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${
                    value.includes(option)
                      ? 'bg-emerald-700 text-emerald-200'
                      : 'text-white hover:bg-emerald-700 hover:text-emerald-200'
                  }`}
                  onClick={() => handleToggleOption(option)}
                >
                  <span>{option}</span>
                  {value.includes(option) && (
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// States array
const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

// Services options for landscaping (alphabetical order)
const landscapingServices = [
  "Commercial Maintenance",
  "Drainage Solutions",
  "Fertilization Programs",
  "Garden Design",
  "Hardscaping",
  "Irrigation Installation",
  "Landscape Design",
  "Lawn Mowing & Maintenance",
  "Mulching Services",
  "Outdoor Lighting",
  "Pest Control",
  "Seasonal Cleanups",
  "Snow Removal",
  "Sod Installation",
  "Tree & Shrub Care"
]

// Business priorities options (grouped with headers)
const businessPriorityGroups = {
  "Operations": [
    "Charge the right price",
    "Hire and keep good workers", 
    "Improve cash flow",
    "Keep customers happy",
    "Make money year-round",
    "Prepare for slow season",
    "Reduce no-shows & cancellations",
    "Run jobs efficiently",
    "Stay better organized"
  ],
  "Marketing & Growth": [
    "Build brand & stand out from competitors",
    "Create local content & blogs",
    "Get more clients",
    "Get more reviews", 
    "Post before/after photos",
    "Run local ads",
    "Show up on Google",
    "Target nearby neighborhoods",
    "Upsell more services"
  ]
}

// Flattened list for the current MultiSelect component (alphabetical)
const businessPriorities = [
  "Build brand & stand out from competitors",
  "Charge the right price", 
  "Create local content & blogs",
  "Get more clients",
  "Get more reviews",
  "Hire and keep good workers",
  "Improve cash flow",
  "Keep customers happy",
  "Make money year-round",
  "Post before/after photos",
  "Prepare for slow season",
  "Reduce no-shows & cancellations",
  "Run jobs efficiently",
  "Run local ads",
  "Show up on Google",
  "Stay better organized",
  "Target nearby neighborhoods",
  "Upsell more services"
]

function ProfileCompletionForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // supabase is imported from our configured client
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [user, setUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    city: '',
    state: '',
    zipCode: '',
    trade: 'landscaping',
    services: [] as string[],
    customService: '',
    teamSize: '',
    targetCustomers: '',
    yearsInBusiness: '',
    businessPriorities: [] as string[]
  })

  useEffect(() => {
    // Get current user and pre-fill data
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Pre-fill email from OAuth data
      const email = searchParams.get('email') || user.email
      
      // Pre-fill name if available from OAuth
      if (user.user_metadata?.full_name) {
        const names = user.user_metadata.full_name.split(' ')
        setFormData(prev => ({
          ...prev,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || ''
        }))
      }
    }
    getUser()
  }, [searchParams, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
    if (formData.services.length === 0 && !formData.customService) newErrors.services = 'Select at least one service'
    if (!formData.teamSize) newErrors.teamSize = 'Team size is required'
    if (!formData.targetCustomers) newErrors.targetCustomers = 'Target customers is required'
    if (!formData.yearsInBusiness) newErrors.yearsInBusiness = 'Years in business is required'
    if (formData.businessPriorities.length === 0) newErrors.businessPriorities = 'Select at least one priority'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          business_name: formData.businessName,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          trade: formData.trade,
          services: formData.customService ? [...formData.services, formData.customService] : formData.services,
          team_size: formData.teamSize,
          target_customers: formData.targetCustomers,
          years_in_business: formData.yearsInBusiness,
          business_priorities: formData.businessPriorities
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to welcome page which handles tracking
        router.push('/welcome')
      } else {
        setErrors({ submit: data.error || 'Failed to complete profile' })
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
      
      {/* Header */}
      <header className="relative z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
                <p className="text-xs text-gray-300">Complete Your Profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Almost There!</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Complete Your Profile
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Tell us about your business to unlock personalized AI insights
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Auto-Selected Plan & Trade */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Plan & Specialization</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Plan Selection */}
                  <div className="border border-emerald-500 bg-emerald-500/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-emerald-300 font-semibold">Free Trial</h4>
                        <p className="text-gray-300 text-sm">7 days full access</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  
                  {/* Trade Selection */}
                  <div className="border border-emerald-500 bg-emerald-500/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-emerald-300 font-semibold">Landscaping AI</h4>
                        <p className="text-gray-300 text-sm">Specialized for your trade</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">First Name <span className="text-red-400">*</span></label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50"
                      disabled={isLoading}
                      required
                      suppressHydrationWarning
                    />
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Last Name <span className="text-red-400">*</span></label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50"
                      disabled={isLoading}
                      required
                      suppressHydrationWarning
                    />
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Business Name <span className="text-red-400">*</span></label>
                  <Input
                    type="text"
                    name="businessName"
                    placeholder="Business name"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50"
                    disabled={isLoading}
                    required
                    suppressHydrationWarning
                  />
                  {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">City <span className="text-red-400">*</span></label>
                    <Input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50"
                      disabled={isLoading}
                      required
                      suppressHydrationWarning
                    />
                    {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">State <span className="text-red-400">*</span></label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {states.map(state => (
                          <SelectItem key={state} value={state} className="text-white hover:bg-gray-700">
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">ZIP Code <span className="text-red-400">*</span></label>
                    <Input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50"
                      disabled={isLoading}
                      required
                      suppressHydrationWarning
                    />
                    {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Services You Offer <span className="text-red-400">*</span></label>
                  <MultiSelect
                    options={landscapingServices}
                    value={formData.services}
                    onChange={(value) => setFormData(prev => ({ ...prev, services: value }))}
                    placeholder="Select your services"
                    disabled={isLoading}
                  />
                  {errors.services && <p className="text-red-400 text-sm mt-1">{errors.services}</p>}
                </div>

                {/* Team Size */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Team Size <span className="text-red-400">*</span></label>
                  <Select 
                    value={formData.teamSize} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="solo" className="text-white hover:bg-gray-700">Just me</SelectItem>
                      <SelectItem value="2-5" className="text-white hover:bg-gray-700">2-5 employees</SelectItem>
                      <SelectItem value="6-10" className="text-white hover:bg-gray-700">6-10 employees</SelectItem>
                      <SelectItem value="11-20" className="text-white hover:bg-gray-700">11-20 employees</SelectItem>
                      <SelectItem value="20+" className="text-white hover:bg-gray-700">20+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.teamSize && <p className="text-red-400 text-sm mt-1">{errors.teamSize}</p>}
                </div>

                {/* Target Customers */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Target Customers <span className="text-red-400">*</span></label>
                  <Select 
                    value={formData.targetCustomers} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, targetCustomers: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select target customers" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="residential" className="text-white hover:bg-gray-700">Residential Only</SelectItem>
                      <SelectItem value="commercial" className="text-white hover:bg-gray-700">Commercial Only</SelectItem>
                      <SelectItem value="both" className="text-white hover:bg-gray-700">Both Residential & Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.targetCustomers && <p className="text-red-400 text-sm mt-1">{errors.targetCustomers}</p>}
                </div>

                {/* Years in Business */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Years in Business <span className="text-red-400">*</span></label>
                  <Select 
                    value={formData.yearsInBusiness} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, yearsInBusiness: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select years in business" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="starting" className="text-white hover:bg-gray-700">Just starting</SelectItem>
                      <SelectItem value="1-2" className="text-white hover:bg-gray-700">1-2 years</SelectItem>
                      <SelectItem value="3-5" className="text-white hover:bg-gray-700">3-5 years</SelectItem>
                      <SelectItem value="6-10" className="text-white hover:bg-gray-700">6-10 years</SelectItem>
                      <SelectItem value="10+" className="text-white hover:bg-gray-700">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.yearsInBusiness && <p className="text-red-400 text-sm mt-1">{errors.yearsInBusiness}</p>}
                </div>

                {/* Business Priorities */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Business Priorities <span className="text-red-400">*</span></label>
                  <GroupedMultiSelect
                    groups={businessPriorityGroups}
                    value={formData.businessPriorities}
                    onChange={(value) => setFormData(prev => ({ ...prev, businessPriorities: value }))}
                    placeholder="Select your top priorities"
                    disabled={isLoading}
                    openUpward={true}
                  />
                  {errors.businessPriorities && <p className="text-red-400 text-sm mt-1">{errors.businessPriorities}</p>}
                </div>

                {errors.submit && (
                  <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                    {errors.submit}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Completing Profile...</span>
                    </div>
                  ) : (
                    <span>Complete Profile & Start Using AI Sidekick</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ProfileCompletionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ProfileCompletionForm />
    </Suspense>
  )
}