"use client"

import React from "react"
import { Sparkles, TrendingUp, Users, Target, Zap, Star, DollarSign, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LearnPage() {
  // Split into 15 sections with 5 questions each for better digestibility
  const questionSections = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Customer Acquisition Strategies",
      color: "from-emerald-500 to-teal-500",
      questions: [
        "Generate a 30-day plan to get 10 new high-value customers",
        "Write a referral program that gets my best customers recommending me",
        "Create a door-to-door script for neighborhoods with dead lawns",
        "How do I get commercial property management contracts?",
        "What's the best way to approach new construction builders?"
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Lead Generation & Conversion",
      color: "from-blue-500 to-indigo-500",
      questions: [
        "Write a compelling Nextdoor post that generates landscape leads",
        "Create a lead magnet offer that attracts homeowners ready to spend",
        "How do I turn one-time customers into recurring maintenance clients?",
        "Design a follow-up sequence for leads who didn't hire me yet",
        "What's the most effective way to network with real estate agents?"
      ]
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Revenue Growth Tactics",
      color: "from-purple-500 to-pink-500",
      questions: [
        "How do I upsell lawn care customers into full landscape design?",
        "What high-margin services should I add to double my profit?",
        "Create a proposal template that wins 70% of my bids",
        "How do I justify premium pricing to price-sensitive customers?",
        "Design a maintenance package that maximizes monthly recurring revenue"
      ]
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Premium Pricing Strategies",
      color: "from-yellow-500 to-orange-500",
      questions: [
        "What's the best way to present add-on services during estimates?",
        "How do I position myself as the premium option in my market?",
        "Create a pricing strategy that eliminates lowball competitors",
        "What seasonal services can I offer to increase winter revenue?",
        "How do I bundle services to increase average project value?"
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Competitive Analysis",
      color: "from-red-500 to-pink-500",
      questions: [
        "Analyze my competitor's website - what are they doing better?",
        "Create a unique selling proposition that sets me apart completely",
        "How do I steal market share from the biggest landscaper in town?",
        "What services are my competitors NOT offering that I should?",
        "How do I position against companies that compete on price?"
      ]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Market Domination",
      color: "from-orange-500 to-red-500",
      questions: [
        "Create a strategy to become the go-to landscaper in my zip code",
        "What makes customers choose one landscaper over another?",
        "How do I differentiate when everyone offers the same services?",
        "Design a competitive analysis framework for my market",
        "What's the best way to respond when customers mention competitors?"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Building Fundamentals",
      color: "from-blue-500 to-teal-500",
      questions: [
        "How do I hire my first reliable crew member?",
        "What questions reveal if someone will be a dependable worker?",
        "Create a training system for new landscape employees",
        "How do I manage multiple crews without being everywhere?",
        "What's the best way to incentivize crew performance and quality?"
      ]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Scaling Operations",
      color: "from-teal-500 to-cyan-500",
      questions: [
        "How do I scale from solo operator to managing 3+ crews?",
        "Create job descriptions that attract quality landscaping talent",
        "What equipment investments will help me handle bigger jobs?",
        "How do I delegate without sacrificing quality standards?",
        "Design a compensation structure that reduces employee turnover"
      ]
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Marketing & Content Creation",
      color: "from-green-500 to-emerald-500",
      questions: [
        "Write 20 social media posts showcasing my recent projects",
        "How do I get 50+ Google reviews from happy customers?",
        "Create a content calendar for year-round landscaping marketing",
        "What's the best way to showcase before/after transformations?",
        "How do I build a reputation as the local landscaping expert?"
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Reputation Building",
      color: "from-emerald-500 to-teal-500",
      questions: [
        "Create email campaigns that keep me top-of-mind with customers",
        "What local SEO strategies will help me rank #1 in my area?",
        "How do I leverage customer success stories for more business?",
        "Design a photography strategy that sells my landscaping work",
        "What partnerships can help me reach more potential customers?"
      ]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Operations & Efficiency",
      color: "from-indigo-500 to-purple-500",
      questions: [
        "How do I schedule jobs to maximize efficiency and profit?",
        "Create a system to track profitability by service type",
        "What's the best way to handle difficult or demanding customers?",
        "How do I streamline estimates to close deals faster?",
        "Design a follow-up system that ensures customer satisfaction"
      ]
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Business Management",
      color: "from-purple-500 to-pink-500",
      questions: [
        "What software tools will help me manage my growing business?",
        "How do I reduce no-shows and last-minute cancellations?",
        "Create a quality control checklist for every completed job",
        "What's the most efficient route planning for maintenance clients?",
        "How do I handle weather delays without losing money?"
      ]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Seasonal Planning",
      color: "from-blue-500 to-indigo-500",
      questions: [
        "Plan my winter strategy to keep revenue flowing year-round",
        "How do I pre-book spring customers during slow season?",
        "What holiday services can I offer for December revenue?",
        "Create a fall cleanup marketing campaign that books solid",
        "How do I prepare customers for spring with advance planning?"
      ]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Year-Round Revenue",
      color: "from-teal-500 to-cyan-500",
      questions: [
        "What winter services are most profitable in cold climates?",
        "Design a seasonal maintenance program customers love",
        "How do I use slow season to set up next year's growth?",
        "What equipment should I invest in for year-round work?",
        "Create a seasonal pricing strategy that maximizes profit"
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Service Expansion",
      color: "from-orange-500 to-red-500",
      questions: [
        "Should I expand into irrigation? Pros and cons for my market",
        "How do I add hardscaping services profitably?",
        "What's the ROI on offering landscape lighting installation?",
        "Should I get into tree service or partner with someone?",
        "How do I transition from maintenance-only to design-build?"
      ]
    }
  ]

  return (
    <>
      <style>{`
        .font-cursive {
          font-family: var(--font-cursive), 'Brush Script MT', cursive;
        }
      `}</style>
      <div className="min-h-screen bg-black text-white">
        {/* Header Navigation */}
        <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <div
                className="flex items-center space-x-3 group cursor-pointer"
                onClick={() => (window.location.href = "/")}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-cursive">
                  AI Sidekick
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-4 py-2"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
                
                <Button
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-2 whitespace-nowrap"
                  onClick={() => window.location.href = '/signup'}
                >
                  Start Free Trial
                  <Sparkles className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white mb-4 sm:mb-6 px-2">
                Why <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent font-cursive">AI Sidekick</span> Works
                <br />
                For Local Trade Businesses
              </h1>
            </div>

            {/* Main Content - Premium SaaS Style */}
            <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
              
              {/* Hero Content */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 sm:p-8 lg:p-12">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                  
                  {/* Main Write-up */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        The Problem with Generic Business Advice
                      </h2>
                      <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                        Most business advice doesn't work for local trades. You've probably tried it — reading generic marketing blogs that tell you to "create valuable content" or "build your brand," but none of it addresses your real challenges: competing with three other landscapers in your zip code, getting calls when it's raining, or convincing homeowners to pay for quality work instead of choosing the cheapest bid.
                      </p>
                      <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                        Traditional business guidance treats all businesses the same. A landscaping company in Phoenix gets the same SEO advice as a software startup in San Francisco. But your challenges are completely different. You need to rank for "landscaping near me" in your specific city, deal with seasonal demand, manage crews, and compete with contractors who undercut your prices.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Advanced AI Architecture Built for Local Trades
                      </h2>
                      <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                        AI Sidekick leverages a sophisticated hybrid model architecture with specialized optimization for local service businesses. Our comprehensive knowledge base includes proven strategies from successful local business implementations, extensive market research, and geo-specific competitive intelligence across U.S. metropolitan areas.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Intelligent Context-Aware Processing
                      </h2>
                      <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                        Our system employs advanced semantic search technology to create intelligent relationships between your business profile, local market conditions, and proven strategies. Every query triggers real-time analysis of your ZIP code's competitive landscape, seasonal trends, and demographic data to ensure recommendations are hyperlocal and actionable.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Real Results, Not Theory
                      </h2>
                      <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                        Every recommendation emerges from our comprehensive knowledge base of successful local business implementations. Our system prioritizes proven strategies with documented success patterns, customer acquisition improvements, and revenue growth tactics. You receive battle-tested approaches grounded in real-world market research, not theoretical frameworks.
                      </p>
                    </div>
                  </div>

                  {/* Technical Specs Panel */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-black/40 backdrop-blur-xl border border-emerald-400/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Technical Architecture
                      </h3>
                      <div className="space-y-4 text-sm">
                        <div className="space-y-2">
                          <span className="text-gray-300 block">AI Engine:</span>
                          <span className="text-white font-medium text-xs leading-relaxed">Hybrid large-language model architecture optimized for local trades</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-gray-300 block">Training Intelligence:</span>
                          <span className="text-white font-medium text-xs leading-relaxed">Comprehensive knowledge base with proven strategies from successful local business implementations, market research, and seasonal planning frameworks</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-gray-300 block">Market Coverage:</span>
                          <span className="text-white font-medium text-xs leading-relaxed">ZIP-code-level competitive intelligence across U.S. metro areas</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-gray-300 block">Data Intelligence:</span>
                          <span className="text-white font-medium text-xs leading-relaxed">Real-time market analysis with hyperlocal insights and competitive business mapping through live data integration</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-gray-300 block">Privacy & Security:</span>
                          <span className="text-white font-medium text-xs leading-relaxed">Enterprise-grade encryption (AES-256), anonymous session handling, and strict data privacy controls</span>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-600/30">
                        <p className="text-xs text-gray-400 leading-relaxed italic">
                          Built to deliver smart, secure, and context-aware insights — without sacrificing your business's privacy or competitive edge.
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/40 backdrop-blur-xl border border-blue-400/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Enterprise Features
                      </h3>
                      <div className="space-y-3 text-sm text-gray-200">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                          Real-time market intelligence
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                          Continuous model optimization
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                          Row-level security protocols
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                          Anonymized global learning
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 backdrop-blur-xl border border-purple-400/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Success Metrics
                      </h3>
                      <div className="space-y-4 text-sm">
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-white">5–10 hrs/week</div>
                          <div className="text-gray-200 text-xs leading-relaxed">Save time by automating business strategy, content planning, and SEO tasks</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-white">3x faster</div>
                          <div className="text-gray-200 text-xs leading-relaxed">Create content with AI-guided prompts tuned to your services, season, and location</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-white">+40% visibility</div>
                          <div className="text-gray-200 text-xs leading-relaxed">Boost local presence by following proven tactics modeled on top-performing businesses</div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-purple-400/20">
                        <p className="text-xs text-gray-400 leading-relaxed italic">
                          These results reflect industry benchmarks and pre-launch performance modeling. Actual outcomes may vary depending on your business and market.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Technical Details */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 sm:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center mb-4">
                      <Users className="w-6 h-6 mr-3 text-emerald-400" />
                      Enterprise-Grade Intelligence Framework
                    </h2>
                    <p className="text-gray-200 text-base leading-relaxed">
                      The platform utilizes a sophisticated feedback integration system: individual user pattern recognition and anonymized global trend analysis. Your interactions are processed through Row Level Security protocols, ensuring complete data privacy while contributing to system-wide knowledge improvements through cryptographically protected pattern recognition.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center mb-4">
                      <Globe className="w-6 h-6 mr-3 text-blue-400" />
                      Real-Time Market Intelligence Integration
                    </h2>
                    <p className="text-gray-200 text-base leading-relaxed">
                      AI Sidekick connects to live data sources including market research APIs, competitive business databases, and seasonal trend analysis to provide dynamic recommendations. When you ask about pricing strategies, the system analyzes current local market conditions, competitor positioning, and regional business patterns to deliver precision-calibrated advice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Security Section */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 sm:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Data Security and Privacy Architecture
                  </h2>
                  <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-4xl mx-auto">
                    All user data is encrypted using AES-256 standards with JWT authentication and secure HTTP-only cookie management. Business-sensitive information is never used to train external models or shared with third parties. Our learning algorithms extract strategic patterns while maintaining complete anonymization of individual business data.
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-black/40 rounded-xl border border-emerald-400/20">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">AES-256 Encryption</h3>
                    <p className="text-gray-300 text-sm">Military-grade data protection</p>
                  </div>
                  
                  <div className="text-center p-4 bg-black/40 rounded-xl border border-blue-400/20">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Row Level Security</h3>
                    <p className="text-gray-300 text-sm">Database-level access control</p>
                  </div>
                  
                  <div className="text-center p-4 bg-black/40 rounded-xl border border-purple-400/20">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Privacy by Design</h3>
                    <p className="text-gray-300 text-sm">No external model training</p>
                  </div>
                  
                  <div className="text-center p-4 bg-black/40 rounded-xl border border-orange-400/20">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Hashed Analytics</h3>
                    <p className="text-gray-300 text-sm">Anonymized pattern learning</p>
                  </div>
                </div>
              </div>

              {/* Question Categories - Clean List Format */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 sm:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      75+ Strategic Questions
                    </span>
                  </h2>
                  <p className="text-gray-300 text-base sm:text-lg">
                    Real questions from successful landscaping business owners - organized by business area
                  </p>
                  <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 mt-6 inline-block">
                    <p className="text-emerald-400 font-semibold flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Sign up to get personalized answers for YOUR specific business situation
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {questionSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-4">
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mr-3 shadow-lg`}>
                          {React.cloneElement(section.icon, { className: "w-5 h-5 text-white" })}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">{section.title}</h3>
                      </div>
                      
                      <ul className="space-y-2">
                        {section.questions.map((question, questionIndex) => (
                          <li 
                            key={questionIndex}
                            className="text-gray-200 text-sm sm:text-base leading-relaxed pl-4 border-l-2 border-gray-600/30 hover:border-emerald-400/50 transition-colors duration-300"
                          >
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12 sm:mt-16 bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 mx-2 sm:mx-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
                Ready to get personalized answers for <span className="text-emerald-400">YOUR</span> business?
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 px-2">
                Start your free trial and get specific strategies for your market, competition, and business goals.
              </p>
              <Button
                onClick={() => window.location.href = '/signup?plan=free-trial'}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-base sm:text-lg lg:text-xl px-8 sm:px-12 py-4 sm:py-6 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <span className="block sm:inline">Start Free Trial - No Credit Card Required</span>
                <Sparkles className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 inline" />
              </Button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-600/30 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div
                className="flex items-center space-x-3 mb-6 md:mb-0 group cursor-pointer"
                onClick={() => (window.location.href = "/")}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-cursive cursor-pointer hover:scale-105 transition-transform duration-300">
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
                <a href="/contact" className="hover:text-white transition-all duration-300 hover:scale-105">
                  Contact
                </a>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-300">
              <p>© 2025 AI Sidekick. Specialized AI for local businesses that want to grow.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}