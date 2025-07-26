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
  Settings,
  ClipboardCheck,
  Bot,
  Shield,
  BookOpen,
  Lightbulb,
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
    <div>
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
        /* Enhanced chat UI animations */
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        @keyframes input-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.2); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1); }
        }
        .animate-input-glow {
          animation: input-glow 3s ease-in-out infinite;
        }
        @keyframes placeholder-cycle {
          0%, 33% { opacity: 1; }
          34%, 66% { opacity: 0; }
          67%, 100% { opacity: 1; }
        }
        .animate-placeholder {
          animation: placeholder-cycle 6s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease-in-out infinite;
        }
        @keyframes bubble-float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-15px) translateX(5px); opacity: 0.7; }
          50% { transform: translateY(-25px) translateX(-3px); opacity: 1; }
          75% { transform: translateY(-10px) translateX(8px); opacity: 0.6; }
        }
        .animate-bubble {
          animation: bubble-float 4s ease-in-out infinite;
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
          /* Mobile-specific sparkle adjustments */
          .animate-sparkle {
            animation-duration: 3s;
          }
        }
      `}</style>
      <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
          <div className="flex items-center h-16 sm:h-20">
            {/* Logo - Left Side */}
            <div className="flex-shrink-0">
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
            </div>

            {/* Mobile spacer to push right elements to right */}
            <div className="flex-1 md:hidden"></div>
            
            {/* Desktop layout: spacer + navigation + spacer */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center space-x-8">
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
            </div>

            {/* Sign In & CTA - Right Side */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-4 py-2"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </Button>
              
              <Button
                className="hidden md:inline-flex bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 text-sm lg:text-base px-4 lg:px-6 py-2 whitespace-nowrap"
                onClick={() => window.location.href = '/signup'}
              >
                Get Early Access
                <Sparkles className="ml-2 w-4 h-4" />
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
      <section className="pt-20 sm:pt-16 pb-16 sm:pb-24 lg:py-32 relative overflow-hidden w-full">
        {/* Hero Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.06),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.05),transparent_60%)]"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/08 to-teal-500/08 rounded-full blur-3xl"></div>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto xl:max-w-none">
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

      {/* Our AI Sidekicks - Available Now */}
      <section id="products" className="min-h-screen sm:min-h-0 py-8 sm:py-16 md:py-24 lg:py-32 relative bg-black w-full flex flex-col justify-center sm:block">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto">
          <div className="text-center mb-8 sm:mb-20">
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
          <div className="mb-8 sm:mb-12 lg:mb-20">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-full px-6 py-3 text-blue-300 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Available Now</span>
              </span>
            </div>

            <div className="w-full sm:max-w-7xl sm:mx-auto relative">
              {/* Live Badge */}
              <div className="absolute -top-3 right-4 sm:right-6 lg:right-8 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full transform rotate-12 shadow-lg animate-pulse z-20">
                🟢 LIVE NOW
              </div>
              
              <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-4">
                    <span className="bg-gradient-to-r from-emerald-500 to-green-700 bg-clip-text text-transparent font-cursive">
                      Ready when you are
                    </span>
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8">
                    Your Full Time AI Landscaping Business Partner
                  </p>
                </div>

                {/* Enhanced Static Chat Interface Preview */}
                <div className="bg-gradient-to-br from-green-800/10 via-emerald-900/5 to-blue-900/5 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl relative group animate-gradient">
                  {/* Single subtle accent - bottom left only */}
                  <div className="absolute bottom-32 left-6 text-blue-300 animate-float delay-500 opacity-30 z-10">💫</div>
                  
                  {/* Floating Tips Icon - moved to avoid overlap */}
                  <div className="absolute top-16 right-4 z-20">
                    <div className="bg-yellow-500/10 backdrop-blur border border-yellow-400/20 rounded-full p-2 hover:scale-110 transition-all duration-300 cursor-pointer">
                      <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 6.343a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z"/>
                      </svg>
                    </div>
                  </div>
                  
                  
                  {/* Header */}
                  <div className="backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 cursor-pointer">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Leaf className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h1 className="text-sm font-bold text-white font-cursive">Sage</h1>
                            <p className="text-xs text-gray-300">Personal Business Strategist</p>
                          </div>
                        </div>
                        
                        <div className="hidden sm:flex items-center space-x-2">
                          <button className="text-gray-200 hover:text-white text-sm px-2 py-1">
                            Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div className="p-4 sm:p-6 md:p-10 h-[400px] sm:h-[340px] overflow-visible" style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}>
                    {/* Enhanced Chat Bubble with Character Inside */}
                    <div className="relative">
                      {/* Chat Bubble - Matches Real /landscaping Interface */}
                      <div className="bg-[#1a1a1a] text-gray-100 px-4 py-2 rounded-2xl relative overflow-visible animate-fade-in">                        
                        
                        {/* Enhanced Character with Sparkles and Hover Effects */}
                        <div className="hidden lg:block absolute -left-8 top-0 z-10 group">
                          <div className="relative transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] rounded-full">
                            {/* Floating sparkles around character */}
                            <div className="absolute -top-2 -left-2 text-yellow-300 animate-pulse">
                              ✨
                            </div>
                            <div className="absolute bottom-12 -right-2 text-purple-300 animate-ping delay-1000">
                              💫
                            </div>
                            
                            {/* Ground shadow under his boots */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black/30 rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Character with hover glow */}
                            <img 
                              src="/character.png?v=4" 
                              alt="Sage character"
                              className="w-72 h-72 object-contain relative z-10 transition-all duration-300 group-hover:scale-105"
                              style={{ 
                                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Text content with margin for bigger character */}
                        <div className="ml-0 lg:ml-48">
                        <div className="space-y-3">
                          <p className="text-gray-50 typography-chat leading-relaxed text-base">
                            Hey there — I'm <span className="font-cursive text-emerald-400 font-semibold text-lg">Sage</span>. Your strategic business sidekick.
                          </p>
                          
                          {/* Simple Professional Divider */}
                          <div className="flex justify-center py-3">
                            <div className="w-16 h-px bg-emerald-400 opacity-40"></div>
                          </div>
                          
                          <p className="text-gray-50 typography-chat leading-relaxed text-sm">
                            Personalized to help you with:
                          </p>
                          
                          <div className="space-y-1.5 ml-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-gray-50 typography-chat leading-relaxed text-sm">Marketing ideas and content creation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-gray-50 typography-chat leading-relaxed text-sm">Upselling strategies</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-gray-50 typography-chat leading-relaxed text-sm">Smarter pricing and seasonal trends</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-gray-50 typography-chat leading-relaxed text-sm">Custom business planning</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              <span className="text-gray-50 typography-chat leading-relaxed text-sm">Scale and grow operations</span>
                            </div>
                          </div>
                          
                          {/* Language Support Section - Mobile Only */}
                          <div className="sm:hidden mt-4">
                            <p className="text-gray-50 typography-chat leading-relaxed text-sm mb-2">
                              Supports 50+ Languages:
                            </p>
                            <div className="space-y-1.5 ml-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-50 typography-chat leading-relaxed text-sm">Speech to text</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-50 typography-chat leading-relaxed text-sm">Text to text</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Pro Tip Box with Glassmorphism */}
                          <div className="hidden sm:block bg-white/5 backdrop-blur border border-green-500/20 rounded-xl shadow p-2.5 animate-fade-in delay-300">
                            <div className="flex items-start space-x-2">
                              <div className="text-emerald-400 text-base">
                                🌱
                              </div>
                              <div>
                                <p className="text-emerald-300 font-medium text-xs uppercase tracking-wide">Pro Tip</p>
                                <p className="text-white text-sm font-bold">Unsure where to start? Ask about a pricing, marketing, or growth goal — I'll help break it down.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Desktop-only Background Watermark - Right Side */}
                        <div className="hidden lg:block absolute right-4 top-8 bottom-8 w-72 pointer-events-none overflow-hidden z-10">
                          {/* Interlocking gears - touching like real gears */}
                          <div className="absolute top-4 left-8 opacity-[0.55] animate-spin" style={{ animationDuration: '20s' }}>
                            <Settings className="w-16 h-16 text-gray-400" />
                          </div>
                          <div className="absolute top-12 left-16 opacity-[0.50] animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}>
                            <Settings className="w-12 h-12 text-gray-500" />
                          </div>
                          
                          {/* Custom clipboard with 3 smaller checkmarks */}
                          <div className="absolute top-8 left-36 opacity-[0.60]">
                            <div className="relative w-20 h-24">
                              {/* Clipboard base */}
                              <div className="w-16 h-20 bg-blue-400 rounded-lg border-2 border-blue-500"></div>
                              {/* Clip at top */}
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-gray-400 rounded-sm"></div>
                              {/* Three checkmarks */}
                              <div className="absolute top-3 left-2 text-white text-sm font-bold">✓</div>
                              <div className="absolute top-7 left-2 text-white text-sm font-bold">✓</div>
                              <div className="absolute top-11 left-2 text-white text-sm font-bold">✓</div>
                            </div>
                          </div>
                          
                          {/* Chat robot - centered between gears and clipboard at bottom */}
                          <div className="absolute bottom-12 left-24 opacity-[0.65]">
                            <Bot className="w-24 h-24 text-emerald-500" />
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Input Area */}
                  <div className="border-t border-white/10 p-4">
                    {/* Sample Query Buttons */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button className="hidden sm:block bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105">
                        How do I raise my prices without losing loyal customers?
                      </button>
                      <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105 w-full sm:w-auto h-8 sm:h-auto flex items-center justify-center">
                        Write me a seasonal blog post and a Facebook ad
                      </button>
                      <button className="hidden sm:block bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105">
                        How do I realistically double my revenue this year?
                      </button>
                      <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105 w-full sm:w-auto h-8 sm:h-auto flex items-center justify-center">
                        Develop a 90 day plan to grow my revenue by >25%
                      </button>
                      <button className="hidden sm:block bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105">
                        I'm stuck. Why isn't my business growing faster?
                      </button>
                      <button className="hidden sm:block bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105">
                        Help me find good workers
                      </button>
                    </div>
                    
                    <div className="w-full">
                        <div className="relative group">
                          <textarea
                            className="w-full bg-white/5 border-2 border-emerald-400/60 text-white placeholder-gray-400 rounded-xl px-4 py-4 pr-20 pb-12 sm:pr-32 sm:pb-16 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base transition-all duration-300"
                            placeholder="What can I help you with today?"
                            rows={4}
                            disabled
                          />
                          {/* Animated placeholder suggestions */}
                          <div className="absolute inset-0 px-4 py-4 pointer-events-none">
                            <div className="text-gray-500 text-base animate-placeholder">
                              <div className="opacity-0">How can I get more customers this month?</div>
                            </div>
                          </div>
                          
                          {/* Mobile: Tools and Tips Text - Desktop: Feature Pills */}
                          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                            {/* Mobile Only: Tools and Tips Text */}
                            <div className="sm:hidden flex items-center space-x-4">
                              <div className="flex items-center space-x-1.5 cursor-pointer">
                                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M18.5 8.5a1 1 0 00-1.414-1.414L14 10.172V6a1 1 0 00-2 0v4.172l-3.086-3.086a1 1 0 00-1.414 1.414L10.586 11.5H6a1 1 0 000 2h4.586L7.5 16.586a1 1 0 001.414 1.414L12 15.414V19a1 1 0 002 0v-3.586l3.086 3.086a1 1 0 001.414-1.414L15.414 13.5H19a1 1 0 000-2h-3.586L18.5 8.5z"/>
                                </svg>
                                <span className="text-blue-400 text-sm font-medium">Tools</span>
                              </div>
                              <div className="flex items-center space-x-1.5 cursor-pointer">
                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                <span className="text-emerald-400 text-sm font-medium">Tips</span>
                              </div>
                            </div>
                            
                            {/* Desktop: Original Green Feature Pills */}
                            <div className="hidden sm:flex items-center space-x-3">
                              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-full px-3 py-1.5 flex items-center space-x-1.5 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all duration-200 cursor-pointer">
                                <Globe className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300 text-xs font-medium">Web Search</span>
                              </div>
                              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-full px-3 py-1.5 flex items-center space-x-1.5 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all duration-200 cursor-pointer">
                                <Upload className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300 text-xs font-medium">File Upload</span>
                              </div>
                              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-full px-3 py-1.5 flex items-center space-x-1.5 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all duration-200 cursor-pointer">
                                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                <span className="text-emerald-300 text-xs font-medium">Tips</span>
                              </div>
                              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-full px-3 py-1.5 flex items-center space-x-1.5 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all duration-200 cursor-pointer">
                                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-emerald-300 text-xs font-medium">Generate Image</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 flex items-center space-x-2">
                            {/* Language Support - Desktop Only */}
                            <div className="hidden sm:block bg-gray-700/50 backdrop-blur border border-gray-600/30 rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-600/50 transition-colors">
                              <span className="text-gray-300 text-xs">Supports 50+ Languages</span>
                            </div>
                            {/* Microphone with Recording Indicator */}
                            <button className="relative p-1.5 text-gray-400 hover:text-emerald-400 transition-colors">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                              </svg>
                              {/* Red Recording Indicator */}
                              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            </button>
                            <button className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Value Props Below Chat */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 md:mt-12 mb-6 sm:mb-8">
                  <div className="text-center p-4 bg-white/5 backdrop-blur border border-emerald-400/20 rounded-xl hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 group">
                    <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-200 transition-colors duration-300">Professional Interface</h4>
                    <p className="text-xs text-gray-300">Built specifically for landscaping businesses</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 backdrop-blur border border-emerald-400/20 rounded-xl hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 group">
                    <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:animate-pulse" />
                    <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-200 transition-colors duration-300">Expert AI Responses</h4>
                    <p className="text-xs text-gray-300">Detailed, actionable business advice</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 backdrop-blur border border-emerald-400/20 rounded-xl hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 group">
                    <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-200 transition-colors duration-300">Real Results</h4>
                    <p className="text-xs text-gray-300">Strategies that increase revenue</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Mobile: Stacked Layout */}
                  <div className="block sm:hidden space-y-6">
                    <div className="text-center space-y-3">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 text-sm px-8 py-4 font-semibold h-12"
                        onClick={() => (window.location.href = "/signup")}
                      >
                        <Zap className="mr-2 w-4 h-4" />
                        <span>Try for Free</span>
                      </Button>
                      <div className="flex items-center justify-center space-x-2 text-xs text-emerald-300">
                        <Shield className="w-3 h-3 flex-shrink-0" />
                        <span>Instant access • 7-day free trial</span>
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <Button
                        size="lg"
                        onClick={() => window.location.href = '/learn'}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-sm px-8 py-4 font-semibold backdrop-blur-sm border border-white/20 h-12"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>How to Use AI Sidekick</span>
                      </Button>
                      <div className="flex items-center justify-center space-x-2 text-xs text-blue-300">
                        <Lightbulb className="w-3 h-3" />
                        <span>Best Practices • Our Suggestions</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Side-by-side Layout */}
                  <div className="hidden sm:block">
                    <div className="flex gap-8 justify-center items-start">
                      <div className="text-center space-y-3 flex-1 max-w-xs">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 text-base px-8 py-4 font-semibold h-14"
                          onClick={() => (window.location.href = "/signup")}
                        >
                          <Zap className="mr-2 w-5 h-5" />
                          <span>Try for Free</span>
                        </Button>
                        <div className="flex items-center justify-center space-x-2 text-sm text-emerald-300">
                          <Shield className="w-4 h-4 flex-shrink-0" />
                          <span>Instant access • 7-day free trial</span>
                        </div>
                      </div>
                      <div className="text-center space-y-3 flex-1 max-w-xs">
                        <Button
                          size="lg"
                          onClick={() => window.location.href = '/learn'}
                          className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-base px-8 py-4 font-semibold backdrop-blur-sm border border-white/20 h-14"
                        >
                          <BookOpen className="w-5 h-5 mr-2" />
                          <span>How to Use AI Sidekick</span>
                        </Button>
                        <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
                          <Lightbulb className="w-4 h-4" />
                          <span>Best Practices • Our Suggestions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
        
        {/* Learn More Button */}
        <div className="text-center mt-12 mb-8">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-400 hover:via-indigo-400 hover:to-blue-400 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 font-semibold"
            onClick={() => window.location.href = '/learn'}
          >
            <span className="flex items-center space-x-2">
              <span>Learn More About AI Sidekick</span>
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
          <p className="text-center text-sm text-gray-400 mt-3 px-4">
            See how our AI Sidekicks help businesses grow revenue and win more customers
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="features"
        className="py-16 sm:py-24 lg:py-32 relative bg-black w-full"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto">
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
                  icon: Star,
                  title: "Trade-Specific Training",
                  description:
                    "Each AI sidekick is trained exclusively on your industry's challenges, opportunities, and best practices.",
                },
                {
                  icon: MapPin,
                  title: "Local Market Focus",
                  description:
                    "Understands local SEO, seasonal patterns, and regional business dynamics that affect your trade.",
                },
                {
                  icon: Sparkles,
                  title: "Instant Expert Advice",
                  description:
                    "Get immediate answers to complex business questions without hiring expensive consultants.",
                },
                {
                  icon: CheckCircle,
                  title: "Built for Real Businesses",
                  description: "Designed for business owners who need results, not tech experts who want to tinker.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-6 group hover:scale-105 transition-all duration-300"
                >
                  <div 
                    className="bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl backdrop-blur-xl border border-white/10 group-hover:shadow-blue-500/20 transition-all duration-300 shadow-lg"
                    style={{
                      width: '64px',
                      height: '64px',
                      aspectRatio: '1 / 1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <feature.icon 
                      className="text-blue-400 stroke-2" 
                      style={{
                        width: '32px',
                        height: '32px',
                        objectFit: 'contain'
                      }}
                    />
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
      <section className="py-16 sm:py-24 lg:py-32 relative bg-gradient-to-br from-gray-950 via-black to-gray-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6">
              <span className="text-white">You don't run a generic business — why use a generic search engine?</span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 max-w-4xl xl:max-w-6xl mx-auto mb-16 lg:mb-20">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-cursive text-2xl xl:text-3xl 2xl:text-4xl">AI Sidekicks</span> are built for your trade — with answers tailored to how your business actually works.
            </p>
          </div>

          {/* 3-Row Comparison Grid */}
          <div className="space-y-8 lg:space-y-12">
            {/* Row 1 - Question Strategy */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
              {/* Left Card - Generic Google Search */}
              <div className="group bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-red-700/30 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/50 cursor-pointer">
                <div className="mb-3 lg:mb-0 lg:absolute lg:top-4 lg:right-4">
                  <span className="text-xs font-medium text-red-300 bg-red-600/20 px-2 py-1 rounded-full transition-all duration-300 group-hover:bg-red-600/40 group-hover:text-red-200">Generic Search</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-red-500/50">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-red-300 mb-2 leading-tight">"How to grow my business?"</h3>
                    <p className="text-red-200/80 text-sm leading-relaxed">17 blog posts. Most don't apply.</p>
                  </div>
                </div>
                {/* Animated glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </div>

              {/* Right Card - AI Sidekick */}
              <div className="group bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-400/30 relative overflow-hidden shadow-2xl shadow-emerald-500/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/60 cursor-pointer">
                <div className="mb-3 lg:mb-0 lg:absolute lg:top-4 lg:right-4">
                  <span className="text-xs font-medium text-emerald-300 bg-emerald-600/20 px-2 py-1 rounded-full transition-all duration-300 group-hover:bg-emerald-600/40 group-hover:text-emerald-200">Your AI Sidekick</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:shadow-2xl group-hover:shadow-emerald-500/60">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-2 transition-all duration-300 group-hover:text-emerald-200 leading-tight">Knows your trade + zip code</h3>
                    <p className="text-emerald-200/80 text-sm leading-relaxed">Personalized advice built for your market.</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none group-hover:from-emerald-500/10 transition-all duration-500"></div>
              </div>
            </div>

            {/* Row 2 - Pricing Clarity */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
              {/* Left Card - Generic Google Search */}
              <div className="group bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-red-700/30 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/50 cursor-pointer">
                <div className="mb-3 lg:mb-0 lg:absolute lg:top-4 lg:right-4">
                  <span className="text-xs font-medium text-red-300 bg-red-600/20 px-2 py-1 rounded-full transition-all duration-300 group-hover:bg-red-600/40 group-hover:text-red-200">Generic Search</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-red-500/50">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-red-300 mb-2 transition-all duration-300 group-hover:text-red-200 leading-tight">"Best prices for services?"</h3>
                    <p className="text-red-200/80 text-sm leading-relaxed">Forums. Guesswork. Conflicting advice.</p>
                  </div>
                </div>
                {/* Animated glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </div>

              {/* Right Card - AI Sidekick */}
              <div className="group bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-400/30 relative overflow-hidden shadow-2xl shadow-emerald-500/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/60 cursor-pointer">
                <div className="mb-3 lg:mb-0 lg:absolute lg:top-4 lg:right-4">
                  <span className="text-xs font-medium text-emerald-300 bg-emerald-600/20 px-2 py-1 rounded-full transition-all duration-300 group-hover:bg-emerald-600/40 group-hover:text-emerald-200">Your AI Sidekick</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:shadow-2xl group-hover:shadow-emerald-500/60">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-2 leading-tight transition-all duration-300 group-hover:text-emerald-200">Built-in pricing insights</h3>
                    <p className="text-emerald-200/80 text-sm leading-relaxed">Suggests upsells, margins, and seasonal promos.</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none group-hover:from-emerald-500/10 transition-all duration-500"></div>
              </div>
            </div>

            {/* Row 3 - Website Help */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
              {/* Left Card - Generic Google Search */}
              <div className="group bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-red-700/30 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/50 cursor-pointer">
                <div className="mb-3 lg:mb-0 lg:absolute lg:top-6 lg:right-4">
                  <span className="text-xs font-medium text-red-300 bg-red-600/20 px-2 py-1 rounded-full transition-all duration-300 group-hover:bg-red-600/40 group-hover:text-red-200">Generic Search</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4 lg:pr-24">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-red-500/50">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-red-300 mb-2 leading-tight transition-all duration-300 group-hover:text-red-200">"Why is my site underperforming?"</h3>
                    <p className="text-red-200/80 text-sm leading-relaxed">SEO jargon. Audits. No clear action.</p>
                  </div>
                </div>
                {/* Animated glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </div>

              {/* Right Card - AI Sidekick */}
              <div className="group bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-400/30 relative overflow-hidden shadow-2xl shadow-emerald-500/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/60 cursor-pointer">
                <div className="mb-3 lg:mb-0 lg:absolute lg:top-4 lg:right-4">
                  <span className="text-xs font-medium text-emerald-300 bg-emerald-600/20 px-2 py-1 rounded-full transition-all duration-300 group-hover:bg-emerald-600/40 group-hover:text-emerald-200">Your AI Sidekick</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:shadow-2xl group-hover:shadow-emerald-500/60">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-2 leading-tight transition-all duration-300 group-hover:text-emerald-200">Clear fixes, no tech talk</h3>
                    <p className="text-emerald-200/80 text-sm leading-relaxed">Improve rankings and leads with simple suggestions.</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none group-hover:from-emerald-500/10 transition-all duration-500"></div>
              </div>
            </div>
          </div>

          {/* Footer Block */}
          <div className="text-center mt-16 lg:mt-20 xl:mt-24">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-4 lg:mb-6">
              Every <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-cursive">AI Sidekick</span> is trained like a business consultant — just for your trade.
            </h3>
            <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-200 mb-8 lg:mb-10 max-w-3xl mx-auto">
              The first is <span className="bg-gradient-to-r from-emerald-400 to-emerald-800 bg-clip-text text-transparent font-cursive text-xl xl:text-2xl 2xl:text-3xl">Sage</span>, our landscaping AI sidekick. More trades coming soon.
            </p>
            
            <Button 
              onClick={() => window.location.href = '/signup'}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-base sm:text-lg lg:text-xl xl:text-2xl px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 lg:py-6 xl:py-8 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 max-w-full min-h-[44px] sm:min-h-[52px] lg:min-h-[56px]"
            >
              <span className="truncate">
                → Explore <span className="font-cursive">Sage</span>
              </span>
              <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 flex-shrink-0" />
            </Button>
            
            <div className="mt-8 lg:mt-10 flex flex-wrap justify-center gap-4 lg:gap-6 xl:gap-8 text-sm lg:text-base xl:text-lg text-gray-300">
              <div className="flex items-center gap-2">
                <Target className="size-4 lg:size-5 xl:size-6 text-emerald-400" /> 
                <span>Trade-Specific Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 lg:size-5 xl:size-6 text-emerald-400" /> 
                <span>Local Market Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 lg:size-5 xl:size-6 text-emerald-400" /> 
                <span>Strategic Business Guidance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More AI Sidekicks - Coming Soon */}
      <section className="py-16 sm:py-24 lg:py-32 relative bg-black w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                More <span className="font-cursive">AI Sidekicks</span>
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              We're building AI specialists for every trade. Join the waitlist to be the first to know when your industry launches.
            </p>
          </div>

          {/* 3x2 Grid - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            
            {/* Electrical AI */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 h-80">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Electrical AI</h3>
                    <p className="text-gray-300 text-sm mb-4">Code compliance, troubleshooting, and safety protocols for electrical contractors.</p>
                    
                    {/* Mini Chat Preview */}
                    <div className="bg-black/40 rounded-lg p-3 space-y-2">
                      <div className="bg-yellow-500/20 rounded p-2 text-xs text-yellow-300">
                        "What's the code requirement for GFCI outlets?"
                      </div>
                      <div className="bg-gray-700/50 rounded p-2 text-xs text-gray-300">
                        NEC 210.8 requires GFCI protection for...
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* HVAC AI */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 h-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">HVAC AI</h3>
                    <p className="text-gray-300 text-sm mb-4">System diagnostics, energy efficiency, and maintenance planning.</p>
                    
                    <div className="bg-black/40 rounded-lg p-3 space-y-2">
                      <div className="bg-blue-500/20 rounded p-2 text-xs text-blue-300">
                        "System running but not cooling properly"
                      </div>
                      <div className="bg-gray-700/50 rounded p-2 text-xs text-gray-300">
                        Check refrigerant levels first...
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Plumbing AI */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 h-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Plumbing AI</h3>
                    <p className="text-gray-300 text-sm mb-4">Pipe calculations, diagnostics, and emergency procedures.</p>
                    
                    <div className="bg-black/40 rounded-lg p-3 space-y-2">
                      <div className="bg-cyan-500/20 rounded p-2 text-xs text-cyan-300">
                        "Water pressure issues throughout house"
                      </div>
                      <div className="bg-gray-700/50 rounded p-2 text-xs text-gray-300">
                        Test main pressure first...
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Roofing AI */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 h-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Roofing AI</h3>
                    <p className="text-gray-300 text-sm mb-4">Material calculations, damage assessment, and weather protocols.</p>
                    
                    <div className="bg-black/40 rounded-lg p-3 space-y-2">
                      <div className="bg-orange-500/20 rounded p-2 text-xs text-orange-300">
                        "Estimate shingles for 2,000 sq ft roof"
                      </div>
                      <div className="bg-gray-700/50 rounded p-2 text-xs text-gray-300">
                        For architectural shingles...
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Pest Control AI */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 h-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Pest Control AI</h3>
                    <p className="text-gray-300 text-sm mb-4">Species identification, treatment protocols, and safety procedures.</p>
                    
                    <div className="bg-black/40 rounded-lg p-3 space-y-2">
                      <div className="bg-green-500/20 rounded p-2 text-xs text-green-300">
                        "Small brown ants in kitchen"
                      </div>
                      <div className="bg-gray-700/50 rounded p-2 text-xs text-gray-300">
                        Likely pharaoh ants. Use gel bait...
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* General Contractor AI */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 h-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Contractor AI</h3>
                    <p className="text-gray-300 text-sm mb-4">Project management, permits, and building code compliance.</p>
                    
                    <div className="bg-black/40 rounded-lg p-3 space-y-2">
                      <div className="bg-purple-500/20 rounded p-2 text-xs text-purple-300">
                        "Need permit for deck addition"
                      </div>
                      <div className="bg-gray-700/50 rounded p-2 text-xs text-gray-300">
                        Check local building department...
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border border-purple-500 hover:border-purple-400 transition-all duration-300 text-base lg:text-lg px-8 py-4 font-semibold"
              onClick={() => (window.location.href = "/contact")}
            >
              <span>Join the Waitlist</span>
              <ArrowRight className="ml-2 w-5 h-5 inline" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-32 bg-black w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 justify-center items-stretch w-full sm:max-w-7xl sm:mx-auto">
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
        className="py-16 sm:py-24 lg:py-32 bg-black w-full"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-4xl sm:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
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
      <footer className="py-16 sm:py-24 lg:py-32 border-t border-gray-600/30 bg-black relative overflow-hidden">
        {/* Footer Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto xl:max-w-none">
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
    </div>
  )
}
