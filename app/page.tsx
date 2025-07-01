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
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 text-sm sm:text-base px-4 sm:px-6 py-2"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              Get Early Access
              <Sparkles className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
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

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm border border-white/20"
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Our AI Sidekicks
                <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 hover:border-white/50"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                Watch Demo
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
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-lg px-8 py-4"
                    onClick={() => (window.location.href = "/landscaping")}
                  >
                    Try Landscaping AI Sidekick
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon */}
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20 px-8 sm:px-12 lg:px-16 rounded-3xl mx-4 sm:mx-8">
            <div className="text-center mb-16">
              <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-600/20 to-blue-600/20 backdrop-blur-xl border border-slate-600/30 rounded-full px-6 py-3 text-slate-700 font-semibold">
                <Sparkles className="w-5 h-5" />
                <span>Coming Soon</span>
              </span>
            </div>

            <div className="space-y-16">
              {/* Electricians */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="lg:pr-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Electricians AI Sidekick</h3>
                  <div className="space-y-3">
                    {[
                      "Smart Pricing",
                      "Code Compliance",
                      "Safety Protocols",
                      "Smart Home Upsells",
                      "Local SEO",
                      "Emergency Contracts",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <span className="text-lg text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white"
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Get Notified
                  </Button>
                </div>
                <Card className="backdrop-blur-2xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-amber-400/20 border-yellow-500/30 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-all duration-300">⚡</div>
                    <h4 className="text-2xl font-semibold text-gray-900 mb-4">Electricians</h4>
                    <p className="text-gray-700 mb-6">
                      Wiring, safety codes, and electrical business growth strategies
                    </p>
                    <div className="flex items-center justify-center space-x-2 bg-yellow-500/20 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-yellow-700 text-sm font-medium">In Development</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Plumbers */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <Card className="backdrop-blur-2xl bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-teal-400/20 border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 group lg:order-1">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-all duration-300">🔧</div>
                    <h4 className="text-2xl font-semibold text-gray-900 mb-4">Plumbers</h4>
                    <p className="text-gray-700 mb-6">Pipe work, emergency services, and customer retention</p>
                    <div className="flex items-center justify-center space-x-2 bg-blue-500/20 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-700 text-sm font-medium">In Development</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="lg:pl-8 lg:order-2">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Plumbers AI Sidekick</h3>
                  <div className="space-y-3">
                    {[
                      "Emergency Calls",
                      "Water Heater Sales",
                      "Pipe Upgrades",
                      "Maintenance Plans",
                      "Local Reputation",
                      "Diagnostic Skills",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-lg text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white"
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Get Notified
                  </Button>
                </div>
              </div>

              {/* HVAC */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="lg:pr-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">HVAC AI Sidekick</h3>
                  <div className="space-y-3">
                    {[
                      "Energy Efficiency",
                      "Premium Pricing",
                      "Seasonal Demand",
                      "Maintenance Contracts",
                      "Smart Technology",
                      "Indoor Air Quality",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-lg text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white"
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Get Notified
                  </Button>
                </div>
                <Card className="backdrop-blur-2xl bg-gradient-to-br from-red-400/20 via-orange-400/20 to-pink-400/20 border-red-500/30 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-all duration-300">🏠</div>
                    <h4 className="text-2xl font-semibold text-gray-900 mb-4">HVAC</h4>
                    <p className="text-gray-700 mb-6">Climate systems, seasonal maintenance, and energy efficiency</p>
                    <div className="flex items-center justify-center space-x-2 bg-red-500/20 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-700 text-sm font-medium">In Development</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Roofers */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <Card className="backdrop-blur-2xl bg-gradient-to-br from-stone-400/20 via-gray-400/20 to-slate-400/20 border-stone-500/30 shadow-2xl hover:shadow-stone-500/20 transition-all duration-500 hover:scale-105 group lg:order-1">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-all duration-300">🏗️</div>
                    <h4 className="text-2xl font-semibold text-gray-900 mb-4">Roofers</h4>
                    <p className="text-gray-700 mb-6">Materials, weather patterns, and insurance claims</p>
                    <div className="flex items-center justify-center space-x-2 bg-stone-500/20 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse"></div>
                      <span className="text-stone-700 text-sm font-medium">In Development</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="lg:pl-8 lg:order-2">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Roofers AI Sidekick</h3>
                  <div className="space-y-3">
                    {[
                      "Insurance Claims",
                      "Storm Damage",
                      "Gutter Systems",
                      "Ventilation Upgrades",
                      "Preventive Plans",
                      "Local Expert Status",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-stone-600 flex-shrink-0" />
                        <span className="text-lg text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-6 bg-gradient-to-r from-stone-500 to-gray-600 hover:from-stone-400 hover:to-gray-500 text-white"
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Get Notified
                  </Button>
                </div>
              </div>

              {/* Pest Control */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="lg:pr-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Pest Control AI Sidekick</h3>
                  <div className="space-y-3">
                    {[
                      "Monthly Contracts",
                      "Prevention Education",
                      "Seasonal Patterns",
                      "Proactive Treatments",
                      "Bed Bug Solutions",
                      "Termite Expertise",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-lg text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white"
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Get Notified
                  </Button>
                </div>
                <Card className="backdrop-blur-2xl bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-teal-400/20 border-green-500/30 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-all duration-300">🐛</div>
                    <h4 className="text-2xl font-semibold text-gray-900 mb-4">Pest Control</h4>
                    <p className="text-gray-700 mb-6">Treatment methods, seasonal pests, and prevention</p>
                    <div className="flex items-center justify-center space-x-2 bg-green-500/20 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 text-sm font-medium">In Development</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center mt-16">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-400 text-gray-700 hover:bg-gray-100 bg-white/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-4 hover:border-gray-500"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                Get Notified When Your Trade Launches
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Simple, Honest Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-200 mb-16">No tokens. No fluff. Just results for your business.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 items-stretch max-w-6xl mx-auto">
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-green-500/30 shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-105">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Free Trial</h3>
                  <div className="text-4xl font-bold text-white mb-4">
                    $0<span className="text-lg font-normal text-gray-300">/7 days</span>
                  </div>
                  <p className="text-gray-200">Test drive our AI sidekicks</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "7-day full access trial",
                    "Try any available AI sidekick",
                    "Unlimited questions & conversations",
                    "All features included",
                    "No credit card required",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start group">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-all duration-300" />
                      <span className="text-gray-200 text-sm text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 text-base py-3"
                    onClick={() => alert("Free trial signup coming soon! Get notified when we launch.")}
                  >
                    Start Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl hover:shadow-xl hover:bg-gray-800/60 transition-all duration-500 hover:scale-105">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Starter Plan</h3>
                  <div className="text-4xl font-bold text-white mb-4">
                    $10<span className="text-lg font-normal text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-200">Perfect for getting started</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Access to available AI sidekick",
                    "Unlimited questions & conversations",
                    "Local SEO guidance",
                    "Content generation tools",
                    "Email support",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start group">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mr-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-all duration-300" />
                      <span className="text-gray-200 text-sm text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-base py-3"
                    onClick={() => alert("Free trial signup coming soon! Get notified when we launch.")}
                  >
                    Start Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-gray-800/60 border-purple-500/40 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 hover:bg-gray-800/80 relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8 h-full flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Pro Plan</h3>
                  <div className="text-4xl font-bold text-white mb-4">
                    $29<span className="text-lg font-normal text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-200">For serious business growth</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Access to ALL AI sidekicks (as they launch)",
                    "Priority support & faster responses",
                    "Advanced business strategies",
                    "Custom industry insights",
                    "Early access to new features",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start group">
                      <CheckCircle className="w-6 h-6 text-purple-400 mr-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-all duration-300" />
                      <span className="text-gray-200 text-sm text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 text-base py-3"
                    onClick={() => alert("Free trial signup coming soon! Get notified when we launch.")}
                  >
                    Start Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
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
