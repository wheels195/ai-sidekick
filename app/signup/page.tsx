"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    location: '',
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

  // Auto-populate plan from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const planParam = urlParams.get('plan')
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
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

  // Trade options and their corresponding services
  const tradeOptions = {
    landscaping: {
      name: 'Landscaping',
      services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation', 'Hardscaping', 'Snow Removal', 'Pest Control']
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    if (!formData.businessName) newErrors.businessName = 'Business name is required'
    if (!formData.location) newErrors.location = 'Location is required'
    // Trade and plan are pre-selected for landscaping trial

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          selectedPlan: formData.selectedPlan,
          businessProfile: {
            business_name: formData.businessName,
            location: formData.location,
            trade: formData.trade,
            services: formData.customService ? [...formData.services, formData.customService] : formData.services,
            team_size: formData.teamSize ? parseInt(formData.teamSize) : null,
            target_customers: formData.targetCustomers,
            years_in_business: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null,
            main_challenges: formData.mainChallenges ? formData.mainChallenges.split(',').map(s => s.trim()) : []
          }
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to appropriate trade page
        const tradePage = formData.trade === 'landscaping' ? '/landscaping' : '/landscaping' // Default to landscaping for now
        window.location.href = tradePage
      } else {
        setErrors({ submit: data.error || 'Failed to create account' })
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
                <h1 className="text-lg font-bold text-white">AI Sidekick</h1>
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
                Create Your Account
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Start your 7-day free trial for landscaping business growth
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">Landscaping Business Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Credentials */}
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
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

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
                    <div className="bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white opacity-75">
                      <div className="flex items-center justify-between">
                        <span>Free Trial - $0 (7 days)</span>
                        <span className="text-emerald-400 text-sm">✓ Selected</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Currently only offering landscaping trials</p>
                  </div>

                  <div>
                    <Input
                      type="text"
                      name="location"
                      placeholder="City, State *"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                      disabled={isLoading}
                    />
                    {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
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
                    <Input
                      type="number"
                      name="teamSize"
                      placeholder="Team size"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                      disabled={isLoading}
                    />
                    <Input
                      type="number"
                      name="yearsInBusiness"
                      placeholder="Years in business"
                      value={formData.yearsInBusiness}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                      disabled={isLoading}
                    />
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
                      
                      {/* Custom Service Input */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={!!formData.customService}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setFormData(prev => ({ ...prev, customService: '' }))
                            }
                          }}
                          className="w-4 h-4 text-blue-500 bg-transparent border-gray-300 rounded focus:ring-blue-500"
                          disabled={isLoading}
                        />
                        <Input
                          type="text"
                          name="customService"
                          placeholder="Other service not listed"
                          value={formData.customService}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 flex-1"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <Input
                    type="text"
                    name="targetCustomers"
                    placeholder="Target customers (e.g., residential, commercial)"
                    value={formData.targetCustomers}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                    disabled={isLoading}
                  />

                  <Textarea
                    name="mainChallenges"
                    placeholder="Main business challenges (comma separated)"
                    value={formData.mainChallenges}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
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
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Create Account & Start Chat</span>
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