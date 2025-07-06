"use client"

import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  FileText,
  DollarSign,
  Star,
  Sparkles,
  Zap,
  Users,
  Target,
} from "lucide-react"
import { PricingCard } from "@/components/ui/pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.2),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.2),transparent_50%)]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/40 to-indigo-500/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-3xl"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                AI Sidekick
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Products", href: "#products" },
                { name: "Pricing", href: "#pricing" },
                { name: "FAQ", href: "#faq" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-200 hover:text-white transition-all duration-300 hover:scale-105 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            <Button
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-2 whitespace-nowrap"
              onClick={() => window.location.href = '/signup'}
            >
              <span className="hidden sm:inline">Get Early Access</span>
              <span className="sm:hidden">Get Access</span>
              <Sparkles className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-6 py-3 mb-8 hover:scale-105 transition-all duration-300">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-blue-300 font-medium">AI-Powered Business Growth</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Specialized AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                For Local Trades
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
              We build AI sidekicks trained specifically for local businesses. No generic advice—just expert guidance
              tailored to your trade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-md sm:max-w-none mx-auto px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 backdrop-blur-sm border border-white/20 text-center"
                onClick={() => window.location.href = '/landscaping'}
              >
                <span className="block sm:inline">Try Landscaping AI Free</span>
                <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 hover:border-white/50 text-center"
                onClick={() => window.location.href = '/signup'}
              >
                Create Your Account
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline" />
              </Button>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-20">
            {[
              {
                icon: Target,
                title: "Instant Local Expertise",
                desc: "Get specific advice for ranking in your city, not generic SEO tips",
              },
              {
                icon: DollarSign,
                title: "Pricing Confidence",
                desc: "Stop undercharging - know exactly what to charge in your market",
              },
              {
                icon: TrendingUp,
                title: "Upsell Opportunities",
                desc: "Discover profitable add-ons you can offer every customer",
              },
              {
                icon: FileText,
                title: "Content That Converts",
                desc: "Get social media posts and website copy that actually brings in leads",
              },
              {
                icon: Star,
                title: "Review Management",
                desc: "Handle bad reviews professionally and get more 5-star ratings",
              },
            ].map((value, index) => (
              <Card
                key={index}
                className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 group"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/10">
                    <value.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="features"
        className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative bg-black"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                How AI Sidekick Works
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              We create specialized AI assistants for each trade, trained on industry-specific knowledge and best
              practices
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: Target,
                  title: "Trade-Specific Training",
                  description:
                    "Each AI sidekick is trained exclusively on your industry's challenges, opportunities, and best practices.",
                },
                {
                  icon: TrendingUp,
                  title: "Local Market Focus",
                  description:
                    "Understands local SEO, seasonal patterns, and regional business dynamics that affect your trade.",
                },
                {
                  icon: Zap,
                  title: "Instant Expert Advice",
                  description:
                    "Get immediate answers to complex business questions without hiring expensive consultants.",
                },
                {
                  icon: Users,
                  title: "Built for Real Businesses",
                  description: "Designed for business owners who need results, not tech experts who want to tinker.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-6 group hover:scale-105 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 group-hover:shadow-blue-500/20 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-200 text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Chat Interface */}
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl lg:rounded-3xl blur-xl"></div>
              <div className="relative backdrop-blur-2xl bg-gray-800/60 rounded-2xl lg:rounded-3xl border border-gray-600/40 shadow-2xl p-4 sm:p-6 lg:p-8 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
                <div className="flex items-center space-x-4 pb-6 border-b border-white/20">
                  <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-200 font-medium">Landscaping AI Sidekick</span>
                </div>

                <div className="space-y-6 mt-6">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs sm:max-w-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                      <p className="text-xs sm:text-sm font-medium">
                        How can I rank higher for "landscaping Dallas" on Google?
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-xl text-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm sm:max-w-lg border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                      <p className="text-xs sm:text-sm leading-relaxed">
                        Great question! For Dallas landscaping SEO, focus on: 1) Optimize your Google Business Profile
                        with Dallas-specific keywords 2) Create neighborhood-specific service pages 3) Get reviews
                        mentioning "Dallas" 4) Build local citations...
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs sm:max-w-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                      <p className="text-xs sm:text-sm font-medium">
                        What should I upsell to lawn maintenance clients?
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-xl text-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm sm:max-w-lg border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                      <p className="text-xs sm:text-sm leading-relaxed">
                        Perfect timing for upsells! Consider: Seasonal fertilization programs, irrigation system
                        maintenance, mulching services, pest control treatments, and landscape lighting installation...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - AI Sidekicks */}
      <section id="products" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative bg-black">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Our AI Sidekicks
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Specialized AI assistants built for specific trades. Each one trained to understand your industry inside
              and out.
            </p>
          </div>

          {/* Available Now - Landscaping */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-full px-6 py-3 text-blue-300 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Available Now</span>
              </span>
            </div>

            <Card className="backdrop-blur-2xl bg-gray-800/60 border-emerald-500/30 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 max-w-4xl mx-auto hover:bg-gray-800/80">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110">
                    <span className="text-3xl">🌿</span>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-4">Landscaping AI Sidekick</h3>
                  <p className="text-xl text-gray-200 mb-8">
                    Your expert partner for growing your landscaping business
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {[
                    {
                      icon: TrendingUp,
                      title: "Local SEO Mastery",
                      desc: "Rank higher in your city's Google Map Pack",
                    },
                    {
                      icon: FileText,
                      title: "Content Generation",
                      desc: "Seasonal blogs and service pages that convert",
                    },
                    { icon: DollarSign, title: "Upsell Strategies", desc: "Increase revenue per customer visit" },
                    { icon: Star, title: "Review Management", desc: "Get more 5-star reviews the right way" },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 group hover:scale-105 transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gray-700/40 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-gray-700/60 transition-all duration-300">
                        <feature.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                        <p className="text-gray-200">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-center"
                    onClick={() => (window.location.href = "/landscaping")}
                  >
                    <span className="block sm:inline">Try Landscaping AI Sidekick</span>
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 inline" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon - AI Sidekicks */}
          <div className="bg-gradient-to-br from-black via-gray-950 to-black py-16 sm:py-24 lg:py-32 relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-6 py-3 mb-8 hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Coming Soon</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                    More AI Sidekicks
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                  Specialized AI assistants for every trade, each trained with industry-specific expertise
                </p>
              </div>

              {/* Trade Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                {/* Electricians AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-yellow-500/30 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Electricians AI</h3>
                      <p className="text-gray-300 text-sm">Wiring, codes & safety expertise</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Smart home upsells",
                        "Code compliance",
                        "Emergency pricing",
                        "Safety protocols"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-2 bg-yellow-500/20 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-yellow-300 text-xs font-medium">In Development</span>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 text-sm py-2"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Get Notified
                    </Button>
                  </CardContent>
                </Card>

                {/* Plumbers AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🔧</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Plumbers AI</h3>
                      <p className="text-gray-300 text-sm">Emergency services & pipe systems</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Emergency call pricing",
                        "Water heater sales",
                        "Pipe upgrade quotes",
                        "Maintenance contracts"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-2 bg-blue-500/20 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 text-xs font-medium">In Development</span>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 text-sm py-2"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Get Notified
                    </Button>
                  </CardContent>
                </Card>

                {/* HVAC AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-red-500/30 shadow-2xl hover:shadow-red-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🏠</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">HVAC AI</h3>
                      <p className="text-gray-300 text-sm">Climate systems & energy efficiency</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Energy efficiency upgrades",
                        "Seasonal maintenance",
                        "Smart system installs",
                        "Air quality solutions"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-2 bg-red-500/20 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-red-300 text-xs font-medium">In Development</span>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-xl hover:shadow-red-500/25 transition-all duration-300 text-sm py-2"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Get Notified
                    </Button>
                  </CardContent>
                </Card>

                {/* Roofers AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-stone-500/30 shadow-2xl hover:shadow-stone-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-500/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-stone-400 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🏗️</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Roofers AI</h3>
                      <p className="text-gray-300 text-sm">Materials, weather & insurance</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Insurance claim guidance",
                        "Storm damage assessment",
                        "Material recommendations",
                        "Preventive maintenance"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-2 bg-stone-500/20 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></div>
                      <span className="text-stone-300 text-xs font-medium">In Development</span>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-stone-500 to-gray-600 hover:from-stone-400 hover:to-gray-500 text-white shadow-xl hover:shadow-stone-500/25 transition-all duration-300 text-sm py-2"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Get Notified
                    </Button>
                  </CardContent>
                </Card>

                {/* Pest Control AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-green-500/30 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🐛</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Pest Control AI</h3>
                      <p className="text-gray-300 text-sm">Treatment methods & prevention</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Monthly service contracts",
                        "Seasonal pest patterns",
                        "Treatment recommendations",
                        "Prevention education"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-2 bg-green-500/20 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-xs font-medium">In Development</span>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-xl hover:shadow-green-500/25 transition-all duration-300 text-sm py-2"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Get Notified
                    </Button>
                  </CardContent>
                </Card>

                {/* General Contractors AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative overflow-hidden md:col-span-2 lg:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🔨</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Contractors AI</h3>
                      <p className="text-gray-300 text-sm">Project management & bidding</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Accurate bid estimates",
                        "Project scheduling",
                        "Subcontractor management",
                        "Material sourcing"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center space-x-2 bg-purple-500/20 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-purple-300 text-xs font-medium">In Development</span>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-xl hover:shadow-purple-500/25 transition-all duration-300 text-sm py-2"
                      onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Get Notified
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-gray-300 mb-6 text-sm sm:text-base">
                  Be the first to know when your trade's AI sidekick launches
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
                  onClick={() => window.location.href = '/signup'}
                >
                  Get Early Access to All Trades
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-32 bg-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
            <h2 className="mb-3 text-3xl font-semibold md:mb-4 lg:mb-6 lg:text-4xl">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Simple, Honest Pricing
              </span>
            </h2>
            <p className="text-muted-foreground lg:text-lg mb-6 md:mb-8 lg:mb-12 text-xl text-gray-200">
              No tokens. No fluff. Just results for your business.
            </p>
          </div>

          {/* Free Trial - Own Container */}
          <div className="rounded-xl flex flex-col justify-between border border-gray-600/30 p-1 mb-6">
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <PricingCard
                  title="Free Trial"
                  price="$0 / 7 days"
                  description="Test drive our AI sidekicks"
                  buttonVariant="outline"
                  buttonText="Start Free Trial"
                  features={[
                    "7-day full access trial",
                    "Full access to your trade's AI sidekick",
                    "Unlimited questions & conversations",
                    "All features included",
                    "No credit card required",
                  ]}
                  onClick={() => window.location.href = '/signup'}
                />
              </div>
            </div>
          </div>

          {/* Three Paid Plans - Separate Container */}
          <div className="rounded-xl flex flex-col justify-between border border-gray-600/30 p-1">
            <div className="flex flex-col gap-4 md:flex-row">
              <PricingCard
                title="Starter Plan"
                price="$10 / mo"
                description="Perfect for getting started"
                buttonVariant="default"
                buttonText="Start Free Trial"
                features={[
                  "Full access to your trade's AI sidekick",
                  "Unlimited questions & conversations",
                  "Local SEO guidance",
                  "Content generation tools",
                  "Email support",
                ]}
                onClick={() => window.location.href = '/signup'}
              />

              <PricingCard
                title="Advanced Plan"
                price="$59 / mo"
                description="Our Most Advanced AI with Real Time Web Search"
                buttonVariant="default"
                highlight
                badge="Most Advanced AI"
                buttonText="Start Free Trial"
                features={[
                  "Everything in Starter Plan",
                  "Powered by Our Most Advanced AI Model",
                  "Real-time web search & research",
                  "Latest industry trends & insights",
                  "Advanced competitive analysis",
                ]}
                onClick={() => window.location.href = '/signup'}
              />

              <PricingCard
                title="Multi-Trade"
                price="$49 / mo"
                description="Access to all trade AI sidekicks"
                buttonVariant="default"
                badge="General Contractors"
                buttonText="Get Multi-Trade Access"
                features={[
                  "Access to ALL trade AI sidekicks",
                  "Perfect for general contractors",
                  "Priority support & faster responses",
                  "Advanced cross-trade strategies",
                  "Early access to new trade launches",
                ]}
                onClick={() => window.location.href = '/signup'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-xl text-gray-200">Everything you need to know about AI Sidekick</p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl hover:shadow-xl transition-all duration-500">
            <CardContent className="p-10">
              <Accordion type="single" collapsible className="space-y-6">
                {[
                  {
                    q: "How is this different from hiring a $200/hour business consultant?",
                    a: "A consultant gives you generic advice and disappears after a few sessions. AI Sidekick is available 24/7, costs less than one consultant hour per month, and is trained specifically on your industry's challenges. Plus, you can ask unlimited questions without watching the clock tick away your budget.",
                  },
                  {
                    q: "Will this actually save me time, or just give me more work to do?",
                    a: "AI Sidekick eliminates the hours you spend researching marketing strategies, writing content, and figuring out pricing. Instead of spending your weekend Googling 'how to get more landscaping customers,' you get expert answers in seconds. Most users save 5-10 hours per week on business development tasks.",
                  },
                  {
                    q: "How do I know the advice is actually good and not just AI nonsense?",
                    a: "Each AI sidekick is trained on proven strategies from successful businesses in your exact industry. We don't use generic business advice—every recommendation is based on what actually works for local trades. Plus, you can test small changes before making big investments.",
                  },
                  {
                    q: "What if my trade isn't available yet? Am I stuck waiting?",
                    a: "Start with our Pro Plan to get early access to new AI sidekicks as they launch. We're adding new trades every month based on demand. Pro members also get input on which trades we prioritize next, so you can influence our roadmap.",
                  },
                  {
                    q: "I'm already spending money on marketing. Can this replace what I'm doing?",
                    a: "AI Sidekick makes your existing marketing more effective rather than replacing it. It helps you write better Google ads, create content that actually converts, and identify which marketing channels are worth your money. Think of it as having a marketing expert optimize everything you're already doing.",
                  },
                  {
                    q: "How quickly will I actually see results in my business?",
                    a: "Most users see improvements within the first month. You'll get immediate help with urgent questions, better content for your website, and smarter pricing strategies. The compound effect builds over time—better SEO, more reviews, higher prices, and more referrals all add up to significant growth.",
                  },
                  {
                    q: "This sounds too good to be true. What's the catch?",
                    a: "The only 'catch' is that you still have to implement the advice. AI Sidekick gives you the roadmap, but you need to do the work. It's not magic—it's just expert guidance available whenever you need it, without the consultant price tag.",
                  },
                  {
                    q: "Will this work for a small business like mine, or is it just for bigger companies?",
                    a: "AI Sidekick is specifically designed for small local businesses. We understand you don't have a marketing team or unlimited budget. Every strategy is built for businesses that need practical, affordable solutions that actually work in competitive local markets.",
                  },
                ].map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/10">
                    <AccordionTrigger className="text-left text-xl font-semibold text-white hover:no-underline hover:text-blue-400 transition-colors duration-300">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-200 pt-4 text-lg leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-600/30 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div
              className="flex items-center space-x-3 mb-6 md:mb-0 group cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                AI Sidekick
              </span>
            </div>

            <div className="flex space-x-8 text-gray-300">
              <a href="/terms" className="hover:text-white transition-all duration-300 hover:scale-105">
                Terms
              </a>
              <a href="/privacy" className="hover:text-white transition-all duration-300 hover:scale-105">
                Privacy
              </a>
              <a
                href="mailto:hello@aisidekick.com"
                className="hover:text-white transition-all duration-300 hover:scale-105"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-300">
            <p>© 2024 AI Sidekick. Specialized AI for local businesses that want to grow.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
