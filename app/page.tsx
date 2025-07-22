"use client"

import React, { useState, useEffect } from "react"
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
  BarChart3,
  Menu,
  X,
  Search,
  Globe,
  Tag,
  MapPin,
  Leaf,
  ArrowLeft,
  Send,
  Paperclip,
  Upload,
} from "lucide-react"
import { ModernPricingCard } from "@/components/ui/modern-pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import DisplayCards from "@/components/ui/display-cards"

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0)
  const [userMessage, setUserMessage] = useState("")
  const [aiMessage, setAiMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [demoStarted, setDemoStarted] = useState(false)
  const [demoComplete, setDemoComplete] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAnnual, setIsAnnual] = useState(true) // Default to annual for savings

  const fullUserMessage = "Help me get 10 more clients in the next 30 days."
  
  const fullAiMessage = `I'll create a 30-day client acquisition plan tailored to your local market. Let me analyze your competition and identify the fastest opportunities...

## Your 30-Day Client Acquisition Strategy

**1. Week 1-2: Quick Wins (Target: 3-4 clients)**
- Local SEO optimization: Get visible for "landscaping near me" 
- Google Business Profile enhancement: Add photos, respond to reviews
- Referral program launch: Incentivize existing clients

**2. Week 3-4: Competitive Advantage (Target: 6-7 additional clients)**
- Undercut competitors on irrigation installs (only 2/6 companies offer this)
- Target premium market gap: Position above average pricing
- Seasonal timing: Spring cleanup packages (peak demand period)

## Immediate Action Items

**3. Today:**
- Update Google Business listing with recent project photos
- Text your last 10 satisfied customers about referral bonuses

**4. This Week:**
- Price irrigation consultations competitively (competitors charge premium rates)
- Create "Spring Ready" package targeting March demand

**Competitive Intelligence:**
Elite Landscape Co. has 234 reviews but charges premium rates ($$$$) - opportunity to offer faster quotes and competitive pricing.

## Revenue Projection
- 10 new clients × average job value = significant additional revenue
- Referral program ROI: Low investment with high return potential

**Want me to write the exact text messages to send your past customers today?**`

  useEffect(() => {
    const startDemo = () => {
      // Set user message immediately
      setUserMessage(fullUserMessage)
      setDemoStep(1)
      setAiMessage("")
      
      // Start web search phase
      setTimeout(() => {
        setDemoStep(2)
        setIsSearching(true)
        
        // Search for 2 seconds, then start AI response
        setTimeout(() => {
          setIsSearching(false)
          setIsTyping(true)
          setDemoStep(3)
          
          // Start AI response after brief pause
          setTimeout(() => {
            setIsTyping(false)
            setDemoStep(4)
            let aiIndex = 0
            const typeAiMessage = () => {
              if (aiIndex < fullAiMessage.length) {
                setAiMessage(fullAiMessage.substring(0, aiIndex + 1))
                aiIndex++
                setTimeout(typeAiMessage, 6 + Math.random() * 10) // Faster typing for longer content
              } else {
                // AI finished, mark demo as complete
                setDemoComplete(true)
              }
            }
            typeAiMessage()
          }, 800)
        }, 2000)
      }, 500)
    }

    // Intersection Observer to start demo when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !demoStarted && !demoComplete) {
            setDemoStarted(true)
            startDemo()
          }
        })
      },
      { threshold: 0.3 }
    )

    const demoElement = document.getElementById('chat-demo')
    if (demoElement) {
      observer.observe(demoElement)
    }

    return () => {
      if (demoElement) {
        observer.unobserve(demoElement)
      }
    }
  }, [demoStarted, demoComplete, fullUserMessage, fullAiMessage])

  // Convert markdown to HTML with emerald headings (similar to chat interface)
  const convertMarkdownToHtml = (markdown: string): string => {
    const lines = markdown.split('\n')
    const htmlLines = []
    let inList = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line === '') {
        if (inList) {
          htmlLines.push('</ul>')
          inList = false
        }
        htmlLines.push('<div class="mb-3"></div>')
        continue
      }
      
      // Headers
      if (line.startsWith('### ')) {
        if (inList) { htmlLines.push('</ul>'); inList = false; }
        htmlLines.push(`<h3 class="text-lg font-semibold text-emerald-400 mt-5 mb-2">${line.substring(4)}</h3>`)
      }
      else if (line.startsWith('## ')) {
        if (inList) { htmlLines.push('</ul>'); inList = false; }
        htmlLines.push(`<h2 class="text-xl font-bold text-emerald-300 mt-6 mb-3">${line.substring(3)}</h2>`)
      }
      // List items
      else if (line.startsWith('- ')) {
        if (!inList) {
          htmlLines.push('<ul class="space-y-2 mb-4 ml-6 list-disc list-outside">')
          inList = true
        }
        const text = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        htmlLines.push(`<li class="text-white leading-relaxed">${text}</li>`)
      }
      // Regular paragraphs
      else {
        if (inList) { htmlLines.push('</ul>'); inList = false; }
        const text = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        
        // Check if this is a numbered title (starts with **1. **2. **3. **4.)
        if (text.match(/^\*\*\d+\./)) {
          htmlLines.push(`<p class="text-emerald-400 font-bold text-lg leading-relaxed mb-3 mt-4">${text}</p>`)
        }
        // Check if this is the final CTA (contains "Want me to write")
        else if (text.includes('Want me to write')) {
          htmlLines.push(`<p class="text-emerald-400 font-bold leading-relaxed mb-3 mt-4">${text}</p>`)
        }
        // Check if this is an ending question
        else if (text.includes('?') && (text.toLowerCase().includes('what') || text.toLowerCase().includes('how') || text.toLowerCase().includes('which'))) {
          htmlLines.push(`<p class="text-emerald-400 font-medium leading-relaxed mb-3 mt-4">${text}</p>`)
        } else {
          htmlLines.push(`<p class="text-white leading-relaxed mb-3">${text}</p>`)
        }
      }
    }
    
    if (inList) htmlLines.push('</ul>')
    return htmlLines.join('\n')
  }

  return (
    <>
      <style>{`
        @keyframes slide-in { 
          0% { opacity: 0; transform: translateX(-50px); } 
          100% { opacity: 1; transform: translateX(0); } 
        }
        .word-animate { 
          display: inline-block; 
          opacity: 0; 
          margin: 0 0.1em; 
          animation: slide-in 0.6s ease-out forwards;
        }
        .font-cursive {
          font-family: var(--font-cursive), 'Brush Script MT', cursive;
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-right {
          animation: scroll-right 60s linear infinite;
          width: 200%;
        }
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
          width: 200%;
        }
        .ticker-row:hover .animate-scroll-right,
        .ticker-row:hover .animate-scroll-left {
          animation-play-state: paused;
        }
        /* Mobile touch - pause on active/focus states */
        @media (hover: none) and (pointer: coarse) {
          .ticker-row:active .animate-scroll-right,
          .ticker-row:active .animate-scroll-left {
            animation-play-state: paused;
          }
          .ticker-card {
            -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
          }
          .ticker-card:active {
            transform: scale(0.98);
            background: rgba(55, 65, 81, 0.8);
          }
        }
      `}</style>
      <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Navbar */}
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

            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Products", href: "#products" },
                { name: "Pricing", href: "#pricing" },
                { name: "FAQ", href: "#faq" },
                { name: "Contact", href: "/contact" },
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

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                className="hidden md:inline-flex text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-4 py-2"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </Button>
              
              <Button
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-2 whitespace-nowrap"
                onClick={() => window.location.href = '/signup'}
              >
                <span className="hidden sm:inline">Get Early Access</span>
                <span className="sm:hidden">Get Access</span>
                <Sparkles className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 p-2"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-in */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu Panel sliding from right */}
          <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-gray-900 via-gray-950 to-black border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-cursive">
                  AI Sidekick
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col p-6 space-y-6">
              {[
                { name: "Features", href: "#features" },
                { name: "Products", href: "#products" },
                { name: "Pricing", href: "#pricing" },
                { name: "FAQ", href: "#faq" },
                { name: "Contact", href: "/contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className="text-lg text-gray-200 hover:text-white transition-all duration-300 py-2"
                >
                  {item.name}
                </a>
              ))}
              
              {/* Sign In Button */}
              <Button
                variant="ghost"
                className="justify-start text-lg text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-0"
                onClick={() => {
                  setShowMobileMenu(false)
                  window.location.href = '/login'
                }}
              >
                Sign In
              </Button>
              
              {/* Get Access Button */}
              <Button
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-base py-3 mt-4"
                onClick={() => {
                  setShowMobileMenu(false)
                  window.location.href = '/signup'
                }}
              >
                Get Early Access
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-8 sm:pt-16 pb-16 sm:pb-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Hero Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.06),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.05),transparent_60%)]"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/08 to-teal-500/08 rounded-full blur-3xl"></div>
        <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-6 py-3 mb-8 mt-8 sm:mt-0 hover:scale-105 transition-all duration-300">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-blue-300 font-medium">AI-Powered Business Growth</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl 3xl:text-9xl font-semibold mb-6 sm:mb-8 leading-tight">
              <div className="mb-2">
                <span className="word-animate bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent" style={{animationDelay: '0.2s'}}>Specialized</span>{' '}
                <span className="word-animate bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent" style={{animationDelay: '0.4s'}}>AI</span>
              </div>
              <div>
                <span className="word-animate bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent" style={{animationDelay: '0.6s'}}>For</span>{' '}
                <span className="word-animate bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent" style={{animationDelay: '0.8s'}}>Local</span>{' '}
                <span className="word-animate bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent" style={{animationDelay: '1.0s'}}>Trades</span>
              </div>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-200 leading-relaxed max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto mb-8 sm:mb-12 px-4">
              We build AI sidekicks trained specifically for local businesses. No generic advice—just expert guidance
              tailored to your trade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-md sm:max-w-none mx-auto px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 backdrop-blur-sm border border-white/20 text-center min-h-[44px] sm:min-h-[48px] lg:min-h-[52px]"
                onClick={() => window.location.href = '/landscaping'}
              >
                <span className="block sm:inline">Try Landscaping AI Free</span>
                <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 hover:border-white/50 text-center min-h-[44px] sm:min-h-[48px] lg:min-h-[52px]"
                onClick={() => window.location.href = '/signup'}
              >
                Create Your Account
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline" />
              </Button>
            </div>
            
            {/* Glass Button */}
            <div className="flex justify-center items-center mt-8">
              <Button
                onClick={() => window.location.href = '/learn'}
                className="bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 text-white hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 text-sm lg:text-base px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25"
              >
                <FileText className="w-4 h-4 mr-2" />
                How to Use <span className="font-cursive">AI Sidekick</span>
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
                metric: "Rank #1 locally",
                color: "blue",
                tag: "AI-Powered",
              },
              {
                icon: DollarSign,
                title: "Pricing Confidence",
                desc: "Stop undercharging - know exactly what to charge in your market",
                metric: "Boost profits 35%",
                color: "emerald",
                tag: "Market Data",
              },
              {
                icon: TrendingUp,
                title: "Upsell Opportunities",
                desc: "Discover profitable add-ons you can offer every customer",
                metric: "3x more revenue",
                color: "purple",
                tag: "Proven Strategy",
              },
              {
                icon: FileText,
                title: "Content That Converts",
                desc: "Get social media posts and website copy that actually brings in leads",
                metric: "5x engagement",
                color: "orange",
                tag: "Real-Time",
              },
              {
                icon: Star,
                title: "Reputation Builder",
                desc: "Turn happy customers into 5-star reviews that build trust and attract new business",
                metric: "90% more reviews",
                color: "yellow",
                tag: "Automated",
              },
              {
                icon: BarChart3,
                title: "Smart Business Insights",
                desc: "Get clear, AI-driven advice on what to fix, improve, or double down on in your business",
                metric: "Save 15+ hrs/week",
                color: "pink",
                tag: "Intelligence",
              },
            ].map((value, index) => (
              <Card
                key={index}
                className="relative backdrop-blur-2xl bg-black/40 border border-white/10 shadow-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden"
              >
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{
                       background: value.color === 'blue' ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))' :
                                  value.color === 'emerald' ? 'linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))' :
                                  value.color === 'purple' ? 'linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))' :
                                  value.color === 'orange' ? 'linear-gradient(45deg, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.1))' :
                                  value.color === 'yellow' ? 'linear-gradient(45deg, rgba(234, 179, 8, 0.1), rgba(16, 185, 129, 0.1))' :
                                  'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))'
                     }}>
                </div>
                
                {/* Feature tag */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    value.color === 'blue' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                    value.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                    value.color === 'purple' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' :
                    value.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                    value.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                    'bg-pink-500/20 text-pink-300 border-pink-400/30'
                  }`}>
                    {value.tag}
                  </span>
                </div>
                
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center relative z-10">
                  {/* Enhanced icon container */}
                  <div className="relative mb-4 mx-auto w-fit">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 backdrop-blur-sm border ${
                      value.color === 'blue' ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-400/30 group-hover:shadow-blue-500/25' :
                      value.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-400/30 group-hover:shadow-emerald-500/25' :
                      value.color === 'purple' ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-400/30 group-hover:shadow-purple-500/25' :
                      value.color === 'orange' ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-400/30 group-hover:shadow-orange-500/25' :
                      value.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-yellow-400/30 group-hover:shadow-yellow-500/25' :
                      'bg-gradient-to-br from-pink-500/20 to-pink-600/30 border-pink-400/30 group-hover:shadow-pink-500/25'
                    } group-hover:shadow-lg`}>
                      <value.icon className={`w-7 h-7 transition-colors duration-300 ${
                        value.color === 'blue' ? 'text-blue-400 group-hover:text-blue-300' :
                        value.color === 'emerald' ? 'text-emerald-400 group-hover:text-emerald-300' :
                        value.color === 'purple' ? 'text-purple-400 group-hover:text-purple-300' :
                        value.color === 'orange' ? 'text-orange-400 group-hover:text-orange-300' :
                        value.color === 'yellow' ? 'text-yellow-400 group-hover:text-yellow-300' :
                        'text-pink-400 group-hover:text-pink-300'
                      }`} />
                    </div>
                    
                    {/* Animated ring */}
                    <div className={`absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 ${
                      value.color === 'blue' ? 'border-blue-400/50' :
                      value.color === 'emerald' ? 'border-emerald-400/50' :
                      value.color === 'purple' ? 'border-purple-400/50' :
                      value.color === 'orange' ? 'border-orange-400/50' :
                      value.color === 'yellow' ? 'border-yellow-400/50' :
                      'border-pink-400/50'
                    }`}></div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-white transition-colors duration-300">
                    <span className={`font-cursive bg-gradient-to-r bg-clip-text text-transparent ${
                      value.color === 'blue' ? 'from-blue-300 to-blue-500' :
                      value.color === 'emerald' ? 'from-emerald-300 to-emerald-500' :
                      value.color === 'purple' ? 'from-purple-300 to-purple-500' :
                      value.color === 'orange' ? 'from-orange-300 to-orange-500' :
                      value.color === 'yellow' ? 'from-yellow-300 to-yellow-500' :
                      'from-pink-300 to-pink-500'
                    }`}>
                      {value.title}
                    </span>
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 group-hover:text-gray-200 transition-colors duration-300">
                    {value.desc}
                  </p>
                  
                  {/* Success metric */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold ${
                      value.color === 'blue' ? 'bg-blue-500/10 text-blue-300 border border-blue-400/20' :
                      value.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20' :
                      value.color === 'purple' ? 'bg-purple-500/10 text-purple-300 border border-purple-400/20' :
                      value.color === 'orange' ? 'bg-orange-500/10 text-orange-300 border border-orange-400/20' :
                      value.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-400/20' :
                      'bg-pink-500/10 text-pink-300 border border-pink-400/20'
                    }`}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {value.metric}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Idea Ticker Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-black overflow-hidden">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Get Inspired
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            Real questions from successful landscaping business owners
          </p>
        </div>

        {/* Ticker Row 1 - Scrolling Right */}
        <div className="relative mb-4 ticker-row">
          <div className="flex animate-scroll-right space-x-4">
            {[
              { category: "Customer Acquisition", question: "Generate a 30-day plan to get 10 new high-value customers", color: "from-emerald-500 to-teal-500" },
              { category: "Revenue Growth", question: "How do I upsell lawn care customers into full landscape design?", color: "from-purple-500 to-pink-500" },
              { category: "Lead Generation", question: "Create a lead magnet offer that attracts homeowners ready to spend", color: "from-blue-500 to-indigo-500" },
              { category: "Competitive Analysis", question: "What services are my competitors NOT offering that I should?", color: "from-red-500 to-pink-500" },
              { category: "Team Building", question: "What questions reveal if someone will be a dependable worker?", color: "from-blue-500 to-teal-500" },
              { category: "Marketing", question: "How do I get 50+ Google reviews from happy customers?", color: "from-green-500 to-emerald-500" },
              { category: "Premium Pricing", question: "How do I position myself as the premium option in my market?", color: "from-yellow-500 to-orange-500" },
              { category: "Market Domination", question: "How do I steal market share from the biggest landscaper in town?", color: "from-orange-500 to-red-500" },
              { category: "Business Growth", question: "Create a proposal template that wins 70% of my bids", color: "from-purple-500 to-pink-500" },
              { category: "Local SEO", question: "What local SEO strategies will help me rank #1 in my area?", color: "from-emerald-500 to-teal-500" },
            ].concat([
              { category: "Customer Acquisition", question: "Generate a 30-day plan to get 10 new high-value customers", color: "from-emerald-500 to-teal-500" },
              { category: "Revenue Growth", question: "How do I upsell lawn care customers into full landscape design?", color: "from-purple-500 to-pink-500" },
              { category: "Lead Generation", question: "Create a lead magnet offer that attracts homeowners ready to spend", color: "from-blue-500 to-indigo-500" },
              { category: "Competitive Analysis", question: "What services are my competitors NOT offering that I should?", color: "from-red-500 to-pink-500" },
              { category: "Team Building", question: "What questions reveal if someone will be a dependable worker?", color: "from-blue-500 to-teal-500" },
              { category: "Marketing", question: "How do I get 50+ Google reviews from happy customers?", color: "from-green-500 to-emerald-500" },
              { category: "Premium Pricing", question: "How do I position myself as the premium option in my market?", color: "from-yellow-500 to-orange-500" },
              { category: "Market Domination", question: "How do I steal market share from the biggest landscaper in town?", color: "from-orange-500 to-red-500" },
              { category: "Business Growth", question: "Create a proposal template that wins 70% of my bids", color: "from-purple-500 to-pink-500" },
              { category: "Local SEO", question: "What local SEO strategies will help me rank #1 in my area?", color: "from-emerald-500 to-teal-500" },
            ]).map((item, index) => (
              <div key={index} className="flex-shrink-0 w-80 h-32 bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative hover:bg-gray-800/60 transition-all duration-300 ticker-card">
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${item.color} text-white`}>
                  {item.category}
                </div>
                <p className="text-white text-sm leading-relaxed mt-8">
                  {item.question}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker Row 2 - Scrolling Left */}
        <div className="relative mb-4 ticker-row">
          <div className="flex animate-scroll-left space-x-4">
            {[
              { category: "Pricing Strategy", question: "Create a pricing strategy that eliminates lowball competitors", color: "from-yellow-500 to-orange-500" },
              { category: "Market Domination", question: "Create a strategy to become the go-to landscaper in my zip code", color: "from-orange-500 to-red-500" },
              { category: "Scaling Operations", question: "How do I scale from solo operator to managing 3+ crews?", color: "from-teal-500 to-cyan-500" },
              { category: "Operations", question: "How do I schedule jobs to maximize efficiency and profit?", color: "from-indigo-500 to-purple-500" },
              { category: "Seasonal Planning", question: "Plan my winter strategy to keep revenue flowing year-round", color: "from-blue-500 to-indigo-500" },
              { category: "Service Expansion", question: "Should I expand into irrigation? Pros and cons for my market", color: "from-orange-500 to-red-500" },
              { category: "Content Creation", question: "Write 20 social media posts showcasing my recent projects", color: "from-green-500 to-emerald-500" },
              { category: "Referral Program", question: "Write a referral program that gets my best customers recommending me", color: "from-emerald-500 to-teal-500" },
              { category: "Door-to-Door", question: "Create a door-to-door script for neighborhoods with dead lawns", color: "from-blue-500 to-indigo-500" },
              { category: "Commercial Contracts", question: "How do I get commercial property management contracts?", color: "from-purple-500 to-pink-500" },
            ].concat([
              { category: "Pricing Strategy", question: "Create a pricing strategy that eliminates lowball competitors", color: "from-yellow-500 to-orange-500" },
              { category: "Market Domination", question: "Create a strategy to become the go-to landscaper in my zip code", color: "from-orange-500 to-red-500" },
              { category: "Scaling Operations", question: "How do I scale from solo operator to managing 3+ crews?", color: "from-teal-500 to-cyan-500" },
              { category: "Operations", question: "How do I schedule jobs to maximize efficiency and profit?", color: "from-indigo-500 to-purple-500" },
              { category: "Seasonal Planning", question: "Plan my winter strategy to keep revenue flowing year-round", color: "from-blue-500 to-indigo-500" },
              { category: "Service Expansion", question: "Should I expand into irrigation? Pros and cons for my market", color: "from-orange-500 to-red-500" },
              { category: "Content Creation", question: "Write 20 social media posts showcasing my recent projects", color: "from-green-500 to-emerald-500" },
              { category: "Referral Program", question: "Write a referral program that gets my best customers recommending me", color: "from-emerald-500 to-teal-500" },
              { category: "Door-to-Door", question: "Create a door-to-door script for neighborhoods with dead lawns", color: "from-blue-500 to-indigo-500" },
              { category: "Commercial Contracts", question: "How do I get commercial property management contracts?", color: "from-purple-500 to-pink-500" },
            ]).map((item, index) => (
              <div key={index} className="flex-shrink-0 w-80 h-32 bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative hover:bg-gray-800/60 transition-all duration-300 ticker-card">
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${item.color} text-white`}>
                  {item.category}
                </div>
                <p className="text-white text-sm leading-relaxed mt-8">
                  {item.question}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker Row 3 - Scrolling Right */}
        <div className="relative ticker-row">
          <div className="flex animate-scroll-right space-x-4">
            {[
              { category: "Business Management", question: "What software tools will help me manage my growing business?", color: "from-purple-500 to-pink-500" },
              { category: "Year-Round Revenue", question: "What winter services are most profitable in cold climates?", color: "from-teal-500 to-cyan-500" },
              { category: "Customer Service", question: "What's the best way to handle difficult or demanding customers?", color: "from-indigo-500 to-purple-500" },
              { category: "Networking", question: "What's the most effective way to network with real estate agents?", color: "from-blue-500 to-indigo-500" },
              { category: "Upselling", question: "What high-margin services should I add to double my profit?", color: "from-purple-500 to-pink-500" },
              { category: "Automation", question: "How do I streamline estimates to close deals faster?", color: "from-indigo-500 to-purple-500" },
              { category: "Retention", question: "How do I turn one-time customers into recurring maintenance clients?", color: "from-blue-500 to-indigo-500" },
              { category: "Hiring", question: "How do I hire my first reliable crew member?", color: "from-blue-500 to-teal-500" },
              { category: "Quality Control", question: "Create a quality control checklist for every completed job", color: "from-purple-500 to-pink-500" },
              { category: "Success Stories", question: "How do I leverage customer success stories for more business?", color: "from-emerald-500 to-teal-500" },
            ].concat([
              { category: "Business Management", question: "What software tools will help me manage my growing business?", color: "from-purple-500 to-pink-500" },
              { category: "Year-Round Revenue", question: "What winter services are most profitable in cold climates?", color: "from-teal-500 to-cyan-500" },
              { category: "Customer Service", question: "What's the best way to handle difficult or demanding customers?", color: "from-indigo-500 to-purple-500" },
              { category: "Networking", question: "What's the most effective way to network with real estate agents?", color: "from-blue-500 to-indigo-500" },
              { category: "Upselling", question: "What high-margin services should I add to double my profit?", color: "from-purple-500 to-pink-500" },
              { category: "Automation", question: "How do I streamline estimates to close deals faster?", color: "from-indigo-500 to-purple-500" },
              { category: "Retention", question: "How do I turn one-time customers into recurring maintenance clients?", color: "from-blue-500 to-indigo-500" },
              { category: "Hiring", question: "How do I hire my first reliable crew member?", color: "from-blue-500 to-teal-500" },
              { category: "Quality Control", question: "Create a quality control checklist for every completed job", color: "from-purple-500 to-pink-500" },
              { category: "Success Stories", question: "How do I leverage customer success stories for more business?", color: "from-emerald-500 to-teal-500" },
            ]).map((item, index) => (
              <div key={index} className="flex-shrink-0 w-80 h-32 bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative hover:bg-gray-800/60 transition-all duration-300 ticker-card">
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${item.color} text-white`}>
                  {item.category}
                </div>
                <p className="text-white text-sm leading-relaxed mt-8">
                  {item.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="features"
        className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative bg-black"
      >
        <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                How <span className="font-cursive">AI Sidekick</span> Works
              </span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
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
                    <h3 className="text-xl sm:text-2xl lg:text-2xl font-medium text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-200 text-base sm:text-lg lg:text-xl leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Chat Interface */}
            <div id="chat-demo" className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl lg:rounded-3xl blur-xl"></div>
              <div className="relative backdrop-blur-2xl bg-gray-800/60 rounded-2xl lg:rounded-3xl border border-gray-600/40 shadow-2xl p-4 sm:p-6 lg:p-8 hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105">
                <div className="flex items-center space-x-4 pb-6 border-b border-white/20">
                  <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-200 font-medium">Trade AI Sidekick</span>
                  <div className="flex items-center space-x-2 ml-auto">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 text-sm">Live Demo</span>
                  </div>
                </div>

                <div className="space-y-6 mt-6 max-h-96 overflow-y-auto">
                  {/* User Message - Always show */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-md shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                      <p className="text-sm font-medium">
                        {demoStep >= 1 ? userMessage : fullUserMessage}
                      </p>
                    </div>
                  </div>

                  {/* AI Thinking Indicator */}
                  {isTyping && (
                    <div className="flex justify-start items-center space-x-2 pl-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-emerald-300 text-xs">AI is thinking...</span>
                    </div>
                  )}

                  {/* Web Search Loading */}
                  {isSearching && (
                    <div className="flex justify-start items-center space-x-3 pl-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-spin">
                          <Search className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                      <span className="text-blue-300 text-xs font-medium">Searching Google Places for local businesses...</span>
                    </div>
                  )}

                  {/* AI Response - Only show when typing or complete */}
                  {demoStep >= 4 && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-xl text-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                        <div className="space-y-3 text-sm leading-relaxed">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: convertMarkdownToHtml(aiMessage) 
                            }}
                          />
                          {demoStep === 4 && aiMessage.length > 0 && !aiMessage.includes('Ready to dominate') && (
                            <span className="animate-pulse text-emerald-400">|</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Default state - show when demo hasn't started */}
                  {demoStep === 0 && !demoStarted && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-emerald-300 font-medium">Scroll to see live demo</p>
                        <p className="text-gray-400 text-sm mt-1">Watch a real conversation unfold</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 backdrop-blur-sm border border-white/20"
                  onClick={() => window.location.href = '/signup?plan=free-trial'}
                >
                  Try For Free
                  <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </Button>
              </div>
              
              {/* Subtle Divider */}
              <div className="mt-16 flex justify-center">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced AI Capabilities Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 relative bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="max-w-7xl xl:max-w-none mx-auto relative">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6">
              <span className="text-white">Real-Time</span>{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-800 bg-clip-text text-transparent font-cursive">
                Competitive Intelligence
              </span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 max-w-4xl xl:max-w-6xl mx-auto mb-16 lg:mb-20">
              Our advanced AI doesn't just respond — it proactively researches your local competitors, pricing gaps, and growth opportunities.
              This isn't generic SEO advice — it's strategic guidance tailored to your business and your zip code.
            </p>
          </div>

          <div className="grid xl:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-start">
            {/* Left Side - AI Capabilities */}
            <div className="space-y-8 lg:space-y-10 lg:pr-8 relative max-w-none">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl xl:text-3xl 2xl:text-4xl font-semibold mb-6 flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-cursive">Advanced AI</span> <span className="text-blue-400">Capabilities</span>
                </h3>
                <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-200 mb-8 lg:mb-10">
                  Get strategic business intelligence that goes far beyond basic search results
                </p>
              </div>
              
              {/* Background Enhancement */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
              </div>
              
              <DisplayCards
                cards={[
                  {
                    icon: <Search className="size-7 text-white drop-shadow-md" />,
                    title: "Live Competitor Analysis",
                    description: "Find local ratings, reviews, pricing strategies, and gaps in your service area with real-time competitive intelligence.",
                    date: "Powered by Advanced AI Sidekick",
                    badge: "Save 15+ hours/week",
                    iconClassName: "blue",
                  },
                  {
                    icon: <Globe className="size-7 text-white drop-shadow-md" />,
                    title: "Website Health Check",
                    description: "Get custom AI-powered suggestions to improve your website's visibility, SEO rankings, and conversion rates.",
                    date: "AI Website Analysis",
                    badge: "Boost visibility 3x",
                    iconClassName: "purple",
                  },
                  {
                    icon: <BarChart3 className="size-7 text-white drop-shadow-md" />,
                    title: "Strategic Growth Insights",
                    description: "Discover pricing opportunities, upselling strategies, and local market trends specific to your zip code and trade.",
                    date: "Zip Code Specific Intelligence",
                    badge: "Increase revenue 25%",
                    iconClassName: "orange",
                  },
                  {
                    icon: <TrendingUp className="size-7 text-white drop-shadow-md" />,
                    title: "Customer Retention AI",
                    description: "Identify at-risk customers, optimize follow-up timing, and create personalized retention strategies that keep clients coming back.",
                    date: "Behavioral Pattern Analysis",
                    badge: "Retain 40% more customers",
                    iconClassName: "emerald",
                  },
                ]}
              />
              
              {/* Bonus Feature - File Upload Analysis */}
              <div className="mt-12 lg:mt-16">
                <div className="group w-full bg-white/5 backdrop-blur-md ring-1 ring-white/10 rounded-xl shadow-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/20 hover:ring-white/30 hover:bg-white/10 transition-all duration-500 ease-out cursor-pointer relative overflow-hidden">
                  {/* Animated glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  
                  <div className="p-4 sm:p-6 lg:p-8 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shrink-0 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-400/50 group-hover:scale-110">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md transition-all duration-300 group-hover:scale-110" />
                        </div>
                        <h4 className="text-base sm:text-lg xl:text-xl font-semibold text-white tracking-tight transition-all duration-300 group-hover:text-white group-hover:scale-105 leading-tight">
                          Upload & Analyze Photos, Files & Content
                        </h4>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full px-3 py-1.5 sm:px-3 sm:py-1 border border-indigo-400/30 transition-all duration-300 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 group-hover:border-indigo-400/50 flex-shrink-0 self-start sm:self-auto">
                        <span className="text-indigo-300 text-xs sm:text-sm font-medium whitespace-nowrap">Instant Expert Results</span>
                      </div>
                    </div>
                    
                    <p className="text-white/80 mb-6 text-sm xl:text-base leading-relaxed tracking-wide transition-colors duration-300 group-hover:text-white/90">
                      Turn any image or document into competitive intelligence
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-300 flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-400/50">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white/80 transition-colors duration-300 group-hover:text-white/90">
                            <span className="font-medium text-indigo-300">Competitor Analysis</span>
                          </span>
                          <p className="text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
                            Price with confidence
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-300 flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-400/50">
                          <Search className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white/80 transition-colors duration-300 group-hover:text-white/90">
                            <span className="font-medium text-purple-300">Expert Diagnosis</span>
                          </span>
                          <p className="text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
                            Solve problems instantly
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-300 flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-400/50">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white/80 transition-colors duration-300 group-hover:text-white/90">
                            <span className="font-medium text-pink-300">Proposal Insights</span>
                          </span>
                          <p className="text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
                            Win more jobs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle animated border on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                       style={{
                         background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                         backgroundSize: '200% 200%',
                       }}>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Generic Google Search */}
            <div className="space-y-8 lg:space-y-10 lg:pl-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-gray-400 mb-6">
                  ❌ Generic Google Search
                </h3>
                <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-400 mb-8 lg:mb-10">
                  Basic search results with no strategic context or actionable insights
                </p>
              </div>
              
              {/* Google-style search results */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                  {/* Search result 1 */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                      Green Lawn Landscaping - Dallas, TX
                    </h4>
                    <p className="text-green-700 text-sm">https://greenlawnlandscaping.com</p>
                    <p className="text-gray-700 text-sm mt-1">
                      Professional landscaping services in Dallas. Call us today for a free estimate. Serving Dallas and surrounding areas for 15 years.
                    </p>
                  </div>
                  
                  {/* Search result 2 */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                      Dallas Landscape Design | Premier Landscaping
                    </h4>
                    <p className="text-green-700 text-sm">https://premierlandscaping.net</p>
                    <p className="text-gray-700 text-sm mt-1">
                      Award-winning landscape design and installation. Residential and commercial. Licensed and insured. Contact us for consultation.
                    </p>
                  </div>
                  
                  {/* Search result 3 */}
                  <div>
                    <h4 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                      Top 10 Landscaping Companies in Dallas - Angie's List
                    </h4>
                    <p className="text-green-700 text-sm">https://angieslist.com/landscaping-dallas</p>
                    <p className="text-gray-700 text-sm mt-1">
                      Find the best landscaping companies in Dallas. Read reviews, compare prices, and get quotes from local professionals.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ What's missing: Pricing insights, competitive gaps, strategic recommendations, website analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16 lg:mt-20 xl:mt-24">
            <p className="text-blue-300 text-lg xl:text-xl 2xl:text-2xl mb-4 lg:mb-6">
              💡 Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-cursive text-xl xl:text-2xl 2xl:text-3xl">Advanced AI Sidekick</span> reviews your website, gives you tips to rank higher, upsell more strategically, and bring you more business.
            </p>
            
            <Button 
              onClick={() => window.location.href = '/signup?plan=free-trial'}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-base sm:text-lg lg:text-xl xl:text-2xl px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 lg:py-6 xl:py-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 max-w-full min-h-[44px] sm:min-h-[52px] lg:min-h-[56px]"
            >
              <span className="truncate">
                <span className="sm:hidden">👉 Start Your Free Trial</span>
                <span className="hidden sm:inline">👉 Start Your Free Trial and Let AI Sidekick Help You Grow</span>
              </span>
              <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 flex-shrink-0" />
            </Button>
            
            <div className="mt-8 lg:mt-10 flex flex-wrap justify-center gap-4 lg:gap-6 xl:gap-8 text-sm lg:text-base xl:text-lg text-gray-300">
              <div className="flex items-center gap-2">
                <Tag className="size-4 lg:size-5 xl:size-6 text-blue-400" /> 
                <span>Competitor Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 lg:size-5 xl:size-6 text-purple-400" /> 
                <span>Zip Code Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="size-4 lg:size-5 xl:size-6 text-orange-400" /> 
                <span>Missing Services</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 lg:size-5 xl:size-6 text-blue-400" /> 
                <span>SEO Visibility</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="size-4 lg:size-5 xl:size-6 text-purple-400" /> 
                <span>Reputation Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - AI Sidekicks */}
      <section id="products" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative bg-black">
        <div className="max-w-7xl xl:max-w-none mx-auto relative px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Our <span className="font-cursive">AI Sidekicks</span>
              </span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
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

            <div className="group backdrop-blur-2xl bg-gray-800/60 border-emerald-500/30 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 max-w-4xl mx-auto hover:bg-gray-800/80 relative rounded-2xl">
              {/* Premium glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Live Badge - positioned outside card */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full transform rotate-12 shadow-lg animate-pulse z-20">
                🟢 LIVE NOW
              </div>
              
              <div className="p-6 sm:p-8 lg:p-12 relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-4">
                    <span className="bg-gradient-to-r from-emerald-500 to-green-700 bg-clip-text text-transparent font-cursive">
                      Ready when you are
                    </span>
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8">
                    Your professional landscaping business AI interface
                  </p>
                </div>

                {/* Static Chat Interface Preview */}
                <div className="bg-gradient-to-br from-black via-gray-950 to-black rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl">
                  
                  {/* Header */}
                  <div className="backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-200 hover:text-white text-sm px-2 py-1 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                          </button>
                          <button className="text-gray-200 hover:text-white text-sm px-2 py-1 flex items-center">
                            <Menu className="w-4 h-4 mr-1" />
                            Chats
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2 cursor-pointer">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Leaf className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h1 className="text-sm font-bold text-white font-cursive">Dirt.i</h1>
                            <p className="text-xs text-gray-300">Your Landscaping AI Sidekick</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-200 hover:text-white text-sm px-2 py-1">
                            Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div className="p-4 h-[340px] overflow-visible">
                    {/* Enhanced Chat Bubble with Character Inside */}
                    <div className="relative">
                      {/* Chat Bubble with softer styling */}
                      <div className="bg-white/10 backdrop-blur-xl text-slate-100 rounded-3xl px-6 py-6 border border-emerald-500/30 shadow-2xl relative overflow-visible"
                           style={{ 
                             boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(16,185,129,0.2)',
                             background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)'
                           }}>
                        
                        {/* Character positioned inside bubble */}
                        <div className="absolute -left-2 bottom-2 z-10">
                          <div className="relative">
                            {/* Character's ground shadow/anchor */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm opacity-60"></div>
                            
                            {/* Character image */}
                            <img 
                              src="/character.png?v=3" 
                              alt="Dirt.i character"
                              className="w-32 h-32 object-contain relative z-10"
                              style={{ 
                                filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.4)) drop-shadow(0 2px 6px rgba(0,0,0,0.3))'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Text content with left margin for character */}
                        <div className="ml-28">
                        <div className="space-y-3 text-sm">
                          <p className="text-base">
                            Hey there — I'm <span className="font-cursive text-emerald-300 font-semibold text-lg">Dirt.i</span>. Your strategic business sidekick.
                          </p>
                          
                          <p className="text-gray-200 text-sm">
                            Personalized to help you with:
                          </p>
                          
                          <div className="space-y-1.5 ml-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-white text-sm">Marketing ideas & content creation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-white text-sm">Upselling strategies</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-white text-sm">Smarter pricing & seasonal trends</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-white text-sm">Custom business planning</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-white text-sm">Scaling operations</span>
                            </div>
                          </div>
                          
                          <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-2.5">
                            <div className="flex items-start space-x-2">
                              <span className="text-emerald-300 text-base">💡</span>
                              <div>
                                <p className="text-emerald-300 font-medium text-xs uppercase tracking-wide">Pro Tip</p>
                                <p className="text-white text-xs">Start with a current problem. Be specific. Let's fix it together.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-white/10 p-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="relative">
                          <textarea
                            className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-20 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                            placeholder="Ask me anything about growing your landscaping business..."
                            rows={2}
                            disabled
                          />
                          <div className="absolute right-2 top-2 flex items-center space-x-1">
                            <button className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors">
                              <Paperclip className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Features row */}
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-blue-400" />
                          <span>Web Search</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Upload className="w-3 h-3 text-emerald-400" />
                          <span>File Upload</span>
                        </span>
                        <span className="flex items-center space-x-1 text-emerald-400">
                          <Sparkles className="w-3 h-3" />
                          <span>Tips</span>
                        </span>
                      </div>
                      <span className="text-emerald-400">⚡ Advanced AI</span>
                    </div>
                  </div>
                </div>

                {/* Value Props Below Chat */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 sm:mt-8 mb-6 sm:mb-8">
                  <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
                    <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-white mb-1">Professional Interface</h4>
                    <p className="text-xs text-gray-300">Built specifically for landscaping businesses</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
                    <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-white mb-1">Expert AI Responses</h4>
                    <p className="text-xs text-gray-300">Detailed, actionable business advice</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
                    <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-white mb-1">Real Results</h4>
                    <p className="text-xs text-gray-300">Strategies that increase revenue</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 font-semibold"
                    onClick={() => (window.location.href = "/signup")}
                  >
                    <span className="block sm:inline">Start Free Trial - No Credit Card</span>
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 inline" />
                  </Button>
                  <p className="text-center text-xs sm:text-sm text-emerald-300 mt-2 sm:mt-3 px-2">
                    ✅ Instant access • 7-day free trial • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon - AI Sidekicks */}
          <div className="bg-gradient-to-br from-black via-gray-950 to-black py-16 sm:py-24 lg:py-32 relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none"></div>

            <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 relative z-10">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-6 py-3 mb-8 hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Coming Soon</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-6">
                  <span className="bg-gradient-to-r from-red-500 to-gray-600 bg-clip-text text-transparent">
                    More <span className="font-cursive">AI Sidekicks</span>
                  </span>
                </h2>
                <p className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl text-gray-300 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
                  Specialized AI assistants for every trade, each trained with industry-specific expertise
                </p>
              </div>

              {/* Trade Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                {/* Electricians AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-yellow-500/30 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative cursor-pointer flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Most Requested Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                    🔥 Most Requested
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
                        <span className="font-cursive bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                          Electricians AI
                        </span>
                      </h3>
                      <p className="text-gray-300 text-sm">Wiring, codes & safety expertise</p>
                      
                      {/* Status Badge */}
                      <div className="mt-3 flex items-center justify-center space-x-2 bg-yellow-500/20 rounded-full px-3 py-1">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-300 text-xs font-medium">Most requested by contractors</span>
                      </div>
                    </div>
                    
                    {/* Interactive Preview */}
                    <div className="bg-black/30 rounded-lg p-4 mb-6 border border-yellow-500/20">
                      <div className="text-xs text-yellow-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Preview</span>
                      </div>
                      <div className="text-xs text-gray-300 italic">
                        "Here's how to market smart home upgrades in your area - average job value increases from $800 to $3,200 when you position it right..."
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      {[
                        { text: "Smart home marketing", revenue: "+$2,400/job" },
                        { text: "Service call optimization", revenue: "3x bookings" },
                        { text: "Emergency rate positioning", revenue: "Premium pricing" },
                        { text: "Customer education content", revenue: "Higher trust" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-gray-200 text-sm">{feature.text}</span>
                          </div>
                          <span className="text-yellow-300 text-xs font-medium">{feature.revenue}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Development Progress</span>
                          <span>78%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 text-sm py-3 font-semibold"
                        onClick={() => window.location.href = '/contact'}
                      >
                        🚀 Get First Access (Save 40%)
                      </Button>
                      
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Est. launch: Q2 2025 • Early bird pricing
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Plumbers AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative cursor-pointer flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* High Demand Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                    💧 High Demand
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🔧</span>
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
                        <span className="font-cursive bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">
                          Plumbers AI
                        </span>
                      </h3>
                      <p className="text-gray-300 text-sm">Emergency services & pipe systems</p>
                      
                      {/* Status Badge */}
                      <div className="mt-3 flex items-center justify-center space-x-2 bg-blue-500/20 rounded-full px-3 py-1">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-300 text-xs font-medium">High demand from plumbers</span>
                      </div>
                    </div>
                    
                    {/* Interactive Preview */}
                    <div className="bg-black/30 rounded-lg p-4 mb-6 border border-blue-500/20">
                      <div className="text-xs text-blue-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Preview</span>
                      </div>
                      <div className="text-xs text-gray-300 italic">
                        "Market emergency services at premium rates - here's how to position maintenance plans that generate $200 recurring monthly revenue..."
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      {[
                        { text: "Emergency service marketing", revenue: "Premium rates" },
                        { text: "Maintenance plan sales", revenue: "$200/month" },
                        { text: "Seasonal preparation content", revenue: "Trust building" },
                        { text: "Customer education campaigns", revenue: "Repeat business" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-200 text-sm">{feature.text}</span>
                          </div>
                          <span className="text-blue-300 text-xs font-medium">{feature.revenue}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Development Progress</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 text-sm py-3 font-semibold"
                        onClick={() => window.location.href = '/contact'}
                      >
                        🚀 Join Waitlist (Save 30%)
                      </Button>
                      
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Est. launch: Q3 2025 • Priority access
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* HVAC AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-red-500/30 shadow-2xl hover:shadow-red-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative cursor-pointer flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Premium Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                    ❄️ Premium
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🏠</span>
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
                        <span className="font-cursive bg-gradient-to-r from-red-300 to-orange-400 bg-clip-text text-transparent">
                          HVAC AI
                        </span>
                      </h3>
                      <p className="text-gray-300 text-sm">Climate systems & energy efficiency</p>
                      
                      {/* Status Badge */}
                      <div className="mt-3 flex items-center justify-center space-x-2 bg-red-500/20 rounded-full px-3 py-1">
                        <Sparkles className="w-3 h-3 text-red-400" />
                        <span className="text-red-300 text-xs font-medium">Premium tier launching soon</span>
                      </div>
                    </div>
                    
                    {/* Interactive Preview */}
                    <div className="bg-black/30 rounded-lg p-4 mb-6 border border-red-500/20">
                      <div className="text-xs text-red-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Preview</span>
                      </div>
                      <div className="text-xs text-gray-300 italic">
                        "Position comfort consultations to sell $1,200 smart thermostat packages - here's the seasonal marketing strategy that works..."
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      {[
                        { text: "Comfort consultation sales", revenue: "+$1,200" },
                        { text: "Maintenance contract marketing", revenue: "$600/visit" },
                        { text: "Energy audit positioning", revenue: "$4K packages" },
                        { text: "Air quality sales scripts", revenue: "+$800" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <span className="text-gray-200 text-sm">{feature.text}</span>
                          </div>
                          <span className="text-red-300 text-xs font-medium">{feature.revenue}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Development Progress</span>
                        <span>42%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-red-400 to-orange-500 h-2 rounded-full" style={{width: '42%'}}></div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-xl hover:shadow-red-500/25 transition-all duration-300 text-sm py-3 font-semibold"
                      onClick={() => window.location.href = '/contact'}
                    >
                      🚀 Reserve Spot (Save 35%)
                    </Button>
                    
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Est. launch: Q4 2025 • Premium pricing
                    </p>
                  </CardContent>
                </Card>

                {/* Roofers AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-stone-500/30 shadow-2xl hover:shadow-stone-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative cursor-pointer flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-500/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Weather Ready Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-stone-400 to-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                    ⛈️ Weather Ready
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-stone-400 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🏗️</span>
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
                        <span className="font-cursive bg-gradient-to-r from-stone-300 to-gray-400 bg-clip-text text-transparent">
                          Roofers AI
                        </span>
                      </h3>
                      <p className="text-gray-300 text-sm">Materials, weather & insurance</p>
                      
                      {/* Status Badge */}
                      <div className="mt-3 flex items-center justify-center space-x-2 bg-stone-500/20 rounded-full px-3 py-1">
                        <Sparkles className="w-3 h-3 text-stone-400" />
                        <span className="text-stone-300 text-xs font-medium">Weather-based alerts included</span>
                      </div>
                    </div>
                    
                    {/* Interactive Preview */}
                    <div className="bg-black/30 rounded-lg p-4 mb-6 border border-stone-500/20">
                      <div className="text-xs text-stone-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Preview</span>
                      </div>
                      <div className="text-xs text-gray-300 italic">
                        "Storm season marketing prep - here's how to position emergency services and maintenance plans for maximum bookings..."
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      {[
                        { text: "Storm response marketing", revenue: "Rapid bookings" },
                        { text: "Preventive maintenance sales", revenue: "$300/month" },
                        { text: "Material cost negotiations", revenue: "20% savings" },
                        { text: "Seasonal business planning", revenue: "Year-round work" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            <span className="text-gray-200 text-sm">{feature.text}</span>
                          </div>
                          <span className="text-stone-300 text-xs font-medium">{feature.revenue}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Development Progress</span>
                        <span>38%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-stone-400 to-gray-600 h-2 rounded-full" style={{width: '38%'}}></div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-stone-500 to-gray-600 hover:from-stone-400 hover:to-gray-500 text-white shadow-xl hover:shadow-stone-500/25 transition-all duration-300 text-sm py-3 font-semibold"
                      onClick={() => window.location.href = '/contact'}
                    >
                      🚀 Secure Early Access (Save 25%)
                    </Button>
                    
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Est. launch: Q1 2026 • Weather alerts included
                    </p>
                  </CardContent>
                </Card>

                {/* Pest Control AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-green-500/30 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative cursor-pointer flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Recurring Revenue Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                    🔄 Recurring $$$
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🐛</span>
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
                        <span className="font-cursive bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                          Pest Control AI
                        </span>
                      </h3>
                      <p className="text-gray-300 text-sm">Treatment methods & prevention</p>
                      
                      {/* Status Badge */}
                      <div className="mt-3 flex items-center justify-center space-x-2 bg-green-500/20 rounded-full px-3 py-1">
                        <Sparkles className="w-3 h-3 text-green-400" />
                        <span className="text-green-300 text-xs font-medium">Recurring revenue specialist</span>
                      </div>
                    </div>
                    
                    {/* Interactive Preview */}
                    <div className="bg-black/30 rounded-lg p-4 mb-6 border border-green-500/20">
                      <div className="text-xs text-green-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Preview</span>
                      </div>
                      <div className="text-xs text-gray-300 italic">
                        "Peak season marketing - position quarterly service plans at $89/month and seasonal add-ons for maximum customer lifetime value..."
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      {[
                        { text: "Contract sales strategies", revenue: "$89/month" },
                        { text: "Seasonal upsell campaigns", revenue: "4x bookings" },
                        { text: "Inspection service marketing", revenue: "+$400" },
                        { text: "Customer retention programs", revenue: "95% renewal" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-gray-200 text-sm">{feature.text}</span>
                          </div>
                          <span className="text-green-300 text-xs font-medium">{feature.revenue}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Development Progress</span>
                        <span>35%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '35%'}}></div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-xl hover:shadow-green-500/25 transition-all duration-300 text-sm py-3 font-semibold"
                      onClick={() => window.location.href = '/contact'}
                    >
                      🚀 Lock In Early Rate (Save 20%)
                    </Button>
                    
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Est. launch: Q2 2026 • Seasonal alerts included
                    </p>
                  </CardContent>
                </Card>

                {/* General Contractors AI Sidekick */}
                <Card className="group backdrop-blur-2xl bg-gray-800/40 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 hover:bg-gray-800/60 relative md:col-span-2 lg:col-span-1 cursor-pointer flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Big Projects Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                    🏗️ Big Projects
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <span className="text-2xl">🔨</span>
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
                        <span className="font-cursive bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                          Contractors AI
                        </span>
                      </h3>
                      <p className="text-gray-300 text-sm">Project management & bidding</p>
                      
                      {/* Status Badge */}
                      <div className="mt-3 flex items-center justify-center space-x-2 bg-purple-500/20 rounded-full px-3 py-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-300 text-xs font-medium">Early bird access available</span>
                      </div>
                    </div>
                    
                    {/* Interactive Preview */}
                    <div className="bg-black/30 rounded-lg p-4 mb-6 border border-purple-500/20">
                      <div className="text-xs text-purple-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Preview</span>
                      </div>
                      <div className="text-xs text-gray-300 italic">
                        "Position project management value - here's how to structure bids that account for delays and increase profit margins by 15%..."
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      {[
                        { text: "Bid strategy optimization", revenue: "+15% margin" },
                        { text: "Timeline communication", revenue: "Client trust" },
                        { text: "Subcontractor coordination", revenue: "Efficiency" },
                        { text: "Procurement negotiations", revenue: "Cost control" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span className="text-gray-200 text-sm">{feature.text}</span>
                          </div>
                          <span className="text-purple-300 text-xs font-medium">{feature.revenue}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Development Progress</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-xl hover:shadow-purple-500/25 transition-all duration-300 text-sm py-3 font-semibold"
                      onClick={() => window.location.href = '/contact'}
                    >
                      🚀 Join Waitlist (Save 50%)
                    </Button>
                    
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Est. launch: Q3 2026 • Early bird exclusive
                    </p>
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
                  className="bg-gradient-to-r from-red-500 to-gray-600 hover:from-red-400 hover:to-gray-500 text-white shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
                  onClick={() => window.location.href = '/contact'}
                >
                  Request Your Trade Next
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-32 bg-black">
        <div className="mx-auto max-w-7xl xl:max-w-none px-6 xl:px-12 2xl:px-20">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6 font-inter">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Simple, Honest Pricing
              </span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 font-inter">
              Try for free. Upgrade to Advanced. Grow your business.
            </p>
          </div>

          {/* Simple Toggle */}
          <div className="flex justify-center items-center gap-4 mb-24">
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 focus:ring-offset-black shadow-lg hover:shadow-xl"
              style={{
                background: isAnnual 
                  ? 'linear-gradient(135deg, #10b981, #0d9488)' 
                  : 'linear-gradient(135deg, #4b5563, #374151)',
                boxShadow: isAnnual 
                  ? '0 4px 14px 0 rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                  : '0 4px 14px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
                style={{
                  boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.2)'
                }}
              />
            </button>
            
            <span className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
              isAnnual 
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-lg' 
                : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
            }`}>
              Annual Billing (Save 25%)
            </span>
          </div>

          {/* All Plans in a Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 justify-center items-stretch max-w-7xl mx-auto">
            <ModernPricingCard
              planName="Free Trial"
              price="0"
              description="Test drive our AI sidekicks for 7 days"
              buttonText="Start Free Trial"
              isAnnual={false}
              features={[
                "7-day full access trial",
                "Full access to your trade's AI sidekick",
                "Unlimited questions & conversations",
                "All features included",
                "No credit card required",
              ]}
              onClick={() => window.location.href = '/signup?plan=free-trial'}
            />

            <ModernPricingCard
              planName="Advanced AI"
              price={isAnnual ? "44" : "59"}
              description="Our most advanced AI with real-time web search"
              buttonText="Grow with Advanced"
              isPopular={true}
              isAnnual={isAnnual}
              savingsText={isAnnual ? "Save 25%" : undefined}
              features={[
                "Full access to your trade's AI sidekick",
                "Unlimited questions & conversations",
                "Powered by our most advanced AI model",
                "Real-time web search & research",
                "Latest industry trends & insights",
                "Advanced competitive analysis",
                "Priority support",
              ]}
              onClick={() => window.location.href = '/signup?plan=advanced'}
            />

            <div className="relative">
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                <div className="transform -rotate-12">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-2 rounded-full text-lg shadow-2xl animate-pulse">
                    COMING SOON
                  </span>
                </div>
              </div>
              
              {/* Blurred Card */}
              <div className="opacity-70">
                <ModernPricingCard
                  planName="Sidepiece AI"
                  price="Contact Us"
                  description="Premium access to all trade AI sidekicks"
                  buttonText="Contact for Pricing"
                  features={[
                    "Access to ALL trade AI sidekicks",
                    "Landscaping, Electrical, HVAC, Plumbing & more",
                    "Higher token limits & priority processing",
                    "Advanced analytics & reporting",
                    "Custom integrations available",
                    "Dedicated account management",
                  ]}
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black"
      >
        <div className="max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6">
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
                    q: "Is this going to actually save me time — or just be another tool I don't end up using?",
                    a: "AI Sidekick eliminates the hours you spend researching marketing strategies, writing content, and figuring out pricing. Instead of spending your weekend Googling 'how to get more landscaping customers,' you get expert answers in seconds. Most users save 5-10 hours per week on business development tasks.",
                  },
                  {
                    q: "How do I know this isn't just generic AI advice?",
                    a: "Each AI sidekick is trained on proven strategies from successful businesses in your exact trade, learns from your specific business context (location, services, team size), and adapts based on what works for similar businesses. We don't use generic business advice—every recommendation is tailored to local trades like yours.",
                  },
                  {
                    q: "What if my trade isn't available yet? Am I stuck waiting?",
                    a: "We're starting with landscaping and adding new trades based on demand. Want yours next? Let us know at hello@aisidekick.com. You can also try the landscaping AI for general business growth strategies that work across trades—pricing, local SEO, customer retention, and more.",
                  },
                  {
                    q: "I'm already spending money on marketing. Can this replace what I'm doing?",
                    a: "This isn't meant to replace your marketing agency — but it can help you make smarter, faster decisions without paying for every question or strategy session. It helps you write better Google ads, create content that actually converts, and identify which marketing channels are worth your money.",
                  },
                  {
                    q: "How quickly will I actually see results in my business?",
                    a: "You'll get immediate help with urgent questions and strategy ideas from day one. During your 7-day trial, you can test pricing strategies, improve your Google Business profile, and create better content. Bigger results like improved SEO rankings and more referrals build over time as you implement the advice consistently.",
                  },
                  {
                    q: "This sounds too good to be true. What's the catch?",
                    a: "No catch. It's free for 7 days while we're testing. If it doesn't help you, no harm done. The only 'catch' is that you still have to implement the advice—AI Sidekick gives you the roadmap, but you need to do the work.",
                  },
                  {
                    q: "Will this work for a small business like mine, or is it just for bigger companies?",
                    a: "AI Sidekick was built specifically for solo operators and small crews. We understand you don't have a marketing team or unlimited budget. Every strategy is designed for businesses that need practical, affordable solutions that actually work in competitive local markets.",
                  },
                  {
                    q: "What happens after the free trial?",
                    a: "After the 7-day free trial, you'll have the option to subscribe if you're seeing value. We'll be upfront about pricing before anything gets charged — no surprise bills. If it's not helping your business, just stop using it.",
                  },
                  {
                    q: "How does the AI learn and get better over time?",
                    a: (
                      <div className="space-y-4">
                        <p>Your AI Sidekick uses a smart, two-layer learning system to improve the more you use it — without compromising your privacy.</p>
                        
                        <div>
                          <h4 className="font-semibold text-white mb-2">1. Personalized learning for your business</h4>
                          <p>As you chat, the AI adapts to your specific trade, location, services, team size, and how you prefer to communicate. It remembers what kind of advice works for your business and gets more accurate over time.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-white mb-2">2. Smarter system-wide improvements (without sharing your info)</h4>
                          <p>We also use anonymous, hashed data to spot bigger trends — like what pricing strategies work best for small crews in the Southeast, or which formats (like checklists vs. paragraphs) people find most helpful. This helps everyone get better answers, faster.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-white mb-2">3. You're in control of your data</h4>
                          <p>All of your data is protected with strong encryption and Row Level Security. Your business info is never shared or used to train outside models, and you can opt out of learning features if you want.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-white mb-2">4. Built-in feedback system</h4>
                          <p>You can rate answers with a quick emoji or star rating. That helps your Sidekick learn what to improve, and helps us find better ways to support businesses like yours.</p>
                        </div>
                      </div>
                    ),
                  },
                ].map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/10">
                    <AccordionTrigger className="text-left text-xl font-medium text-white hover:no-underline hover:text-blue-400 transition-colors duration-300">
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
      <footer className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-600/30 bg-black relative overflow-hidden">
        {/* Footer Background Elements */}
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
              <span className="text-2xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-cursive cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
