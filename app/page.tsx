"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
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
  Calculator,
  UserPlus,
  Megaphone,
  Brain,
  ChevronUp,
} from "lucide-react"
import { ModernPricingCard } from "@/components/ui/modern-pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import DisplayCards from "@/components/ui/display-cards"
import TestimonialCarousel from "@/components/TestimonialCarousel"
import { supabase } from '@/lib/supabase/client'

// Typewriter component for animated text
function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50) // 50ms delay between each letter

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  // Split the text to apply different gradients
  const renderText = () => {
    const words = displayedText.split(' ')
    const specializedAI = words.slice(0, 2).join(' ')
    const forLandscapers = words.slice(2).join(' ')

    return (
      <>
        {specializedAI && (
          <div className="mb-2">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
              {specializedAI}
            </span>
          </div>
        )}
        {forLandscapers && (
          <div>
            <span className="bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text text-transparent">
              <span>{forLandscapers.split(' ')[0]}</span>
              <span>&nbsp;</span>
              <span className="tracking-wide">
                <span className="font-cursive">{forLandscapers.split(' ')[1]?.charAt(0)}</span>
                <span>{forLandscapers.split(' ')[1]?.slice(1)}</span>
              </span>
            </span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="inline-block min-h-[1.2em] relative">
      {renderText()}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [demoStep, setDemoStep] = useState(0)
  const [userMessage, setUserMessage] = useState("")
  const [aiMessage, setAiMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [demoStarted, setDemoStarted] = useState(false)
  const [demoComplete, setDemoComplete] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAnnual, setIsAnnual] = useState(true) // Default to annual for savings
  const [activeIdeasCategory, setActiveIdeasCategory] = useState<string | null>(null)

  // Scroll animation hook
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible')
        }
      })
    }, { threshold: 0.1 })

    const elementsToAnimate = document.querySelectorAll('.fade-left, .fade-right')
    elementsToAnimate.forEach((el) => observer.observe(el))

    // Special handling for feature cards with staggered animation
    const featureCardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible')
        }
      })
    }, { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }) // Higher threshold and margin to trigger later

    const featureCards = document.querySelectorAll('.feature-card-animate')
    featureCards.forEach((el) => featureCardsObserver.observe(el))

    return () => {
      elementsToAnimate.forEach((el) => observer.unobserve(el))
      featureCards.forEach((el) => featureCardsObserver.unobserve(el))
    }
  }, [])

  const fullUserMessage = "Help me get 10 more clients in the next 30 days."
  
  // Ideas categories data
  const ideasCategories = {
    'pricing': {
      name: 'Pricing & Services',
      icon: Calculator,
      questions: [
        'How much should I charge for lawn care in my area right now?',
        'Should I offer seasonal packages or stick to per-visit pricing?',
        'What services could I upsell during fall and winter to keep revenue steady?'
      ]
    },
    'growth': {
      name: 'Growth Strategy',
      icon: TrendingUp,
      questions: [
        'How can I grow my business without hiring more people yet?',
        'What would a smart 90-day growth plan look like for me?',
        'What are 3 things I could do this week to get more high-paying jobs?'
      ]
    },
    'hiring': {
      name: 'Hiring & Team',
      icon: UserPlus,
      questions: [
        'How do I find and keep good workers without overpaying?',
        "What's the best way to structure pay or bonuses to keep my crew motivated?"
      ]
    },
    'marketing': {
      name: 'Marketing & Ads',
      icon: Megaphone,
      questions: [
        'What should I post on Facebook this month to get new leads?',
        'How do I run a Google ad that actually brings in local customers?',
        'How do I ask for reviews in a way that actually works?'
      ]
    },
    'mindset': {
      name: 'Mindset & Decisions',
      icon: Brain,
      questions: [
        "Why do I feel like I'm working harder but not making more?",
        'Am I leaving money on the table with the way I quote jobs?',
        'What do other landscapers in my area charge — and how do I compare?'
      ]
    }
  }

  // Categories for mobile (only show 3)
  const mobileCategories = ['pricing', 'growth', 'hiring']

  // Click outside to close functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.ideas-container')) {
        setActiveIdeasCategory(null)
      }
    }

    if (activeIdeasCategory) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeIdeasCategory])
  
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

  // Handle OAuth callback on homepage
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log('OAuth callback detected on homepage, redirecting to login for processing...')
        // Redirect to login page with the hash fragment intact
        router.push(`/login${window.location.hash}`)
      }
    }
    
    handleOAuthCallback()
  }, [router])

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
        
        /* Working Scroll Animations */
        .fade-left {
          opacity: 0;
          transform: translateX(-50px);
          transition: all 1s ease-out;
        }
        
        /* Feature cards start hidden and slide in from left */
        .feature-card-animate {
          opacity: 0;
          transform: translateX(-80px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .feature-card-animate.animate-visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        /* Delays for feature cards */
        .feature-card-animate.delay-0 { transition-delay: 0ms; }
        .feature-card-animate.delay-300 { transition-delay: 300ms; }
        .feature-card-animate.delay-600 { transition-delay: 600ms; }
        .feature-card-animate.delay-900 { transition-delay: 900ms; }
        .feature-card-animate.delay-1200 { transition-delay: 1200ms; }
        .feature-card-animate.delay-1500 { transition-delay: 1500ms; }
        
        .fade-right {
          opacity: 0;
          transform: translateX(50px);
          transition: all 1s ease-out;
        }
        
        .fade-left.animate-visible,
        .fade-right.animate-visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        /* Staggered delays for individual elements */
        .fade-left.delay-0 { transition-delay: 0ms; }
        .fade-left.delay-200 { transition-delay: 200ms; }
        .fade-left.delay-300 { transition-delay: 300ms; }
        .fade-left.delay-400 { transition-delay: 400ms; }
        .fade-left.delay-600 { transition-delay: 600ms; }
        .fade-left.delay-800 { transition-delay: 800ms; }
        .fade-left.delay-900 { transition-delay: 900ms; }
        .fade-left.delay-1000 { transition-delay: 1000ms; }
        .fade-left.delay-1200 { transition-delay: 1200ms; }
        .fade-left.delay-1400 { transition-delay: 1400ms; }
        .fade-left.delay-1500 { transition-delay: 1500ms; }
        .fade-left.delay-1600 { transition-delay: 1600ms; }
        .fade-left.delay-1800 { transition-delay: 1800ms; }
        .fade-left.delay-2000 { transition-delay: 2000ms; }
        .fade-right.delay-400 { transition-delay: 400ms; }
        .fade-right.delay-600 { transition-delay: 600ms; }
        .fade-right.delay-800 { transition-delay: 800ms; }
        .fade-right.delay-1000 { transition-delay: 1000ms; }
        .fade-right.delay-1200 { transition-delay: 1200ms; }
        .fade-right.delay-1400 { transition-delay: 1400ms; }
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
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-icon-pulse {
          animation: icon-pulse 6s ease-in-out infinite;
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
                onClick={async () => {
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                      router.push('/landscaping')
                    } else {
                      router.push('/login')
                    }
                  } catch (error) {
                    console.warn('Auth check failed, redirecting to login:', error)
                    router.push('/login')
                  }
                }}
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
                onClick={async () => {
                  setShowMobileMenu(false)
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                      router.push('/landscaping')
                    } else {
                      router.push('/login')
                    }
                  } catch (error) {
                    console.warn('Auth check failed, redirecting to login:', error)
                    router.push('/login')
                  }
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
      <section className="pt-20 sm:pt-16 pb-16 sm:pb-24 lg:py-32 relative overflow-hidden w-full scroll-animate">
        {/* Hero Background Elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/08 to-teal-500/08 rounded-full blur-3xl"></div>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto xl:max-w-none">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-6 py-3 mb-8 mt-8 sm:mt-0 hover:scale-105 transition-all duration-300">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-blue-300 font-medium">AI-Powered Business Growth</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl 3xl:text-9xl font-normal mb-6 sm:mb-8 leading-tight">
              <TypewriterText text="Specialized AI For Landscapers" />
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-200 leading-relaxed max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto mb-8 sm:mb-12 px-4">
              An AI web app built for landscapers — to help you quote faster, upsell more services, grow your business, and make smarter decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-md sm:max-w-none mx-auto px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 backdrop-blur-sm border border-white/20 text-center min-h-[44px] sm:min-h-[48px] lg:min-h-[52px]"
                onClick={() => window.location.href = '/signup'}
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
                icon: BarChart3,
                title: "Smart Business Insights",
                desc: "Get clear, AI-driven advice on what to fix, improve, or double down on in your business",
                metric: "Save 15+ hrs/week",
                tag: "Intelligence",
              },
              {
                icon: DollarSign,
                title: "Pricing Confidence",
                desc: "Stop undercharging - know exactly what to charge in your market",
                metric: "Boost profits 35%",
                tag: "Market Data",
              },
              {
                icon: TrendingUp,
                title: "Upsell Opportunities",
                desc: "Discover profitable add-ons you can offer every customer",
                metric: "3x more revenue",
                tag: "Proven Strategy",
              },
              {
                icon: FileText,
                title: "Content That Converts",
                desc: "Get social media posts and website copy that actually brings in leads",
                metric: "5x engagement",
                tag: "Real-Time",
              },
              {
                icon: Star,
                title: "Reputation Builder",
                desc: "Turn happy customers into 5-star reviews that build trust and attract new business",
                metric: "90% more reviews",
                tag: "Automated",
              },
              {
                icon: Target,
                title: "Instant Local Expertise",
                desc: "Get specific advice for ranking in your city, not generic SEO tips",
                metric: "Rank #1 locally",
                tag: "AI-Powered",
              },
            ].map((value, index) => {
              const delayClass = `delay-${index * 300}` // Increased delay to 300ms between cards
              return (
                <Card
                  key={index}
                  className={`relative bg-black border border-emerald-500/30 shadow-xl cursor-pointer group overflow-hidden hover:border-emerald-500/60 hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:-translate-y-3 hover:scale-105 feature-card-animate ${delayClass}`}
              >
                {/* Subtle gradient highlight - always visible */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
                
                {/* Feature tag */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {value.tag}
                  </span>
                </div>
                
                <CardContent className="p-6 sm:p-8 text-left relative z-10">
                  {/* Icon with subtle pulse animation */}
                  <div className="relative mb-4 w-fit">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40">
                      <value.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-medium mb-3 text-white font-sans">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 font-normal">
                    {value.desc}
                  </p>
                  
                  {/* Success metric - always visible */}
                  <div className="mt-auto">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/[0.03] text-gray-200 border border-white/10">
                      <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
                      {value.metric}
                    </span>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our AI Sidekicks - Available Now */}
      <section id="products" className="min-h-screen sm:min-h-0 py-8 sm:py-16 md:py-24 lg:py-32 relative bg-black w-full flex flex-col justify-center sm:block">
        <div className="w-full">
          <div className="text-center mb-8 sm:mb-20 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6 fade-left delay-0">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Our <span className="font-cursive">AI Sidekicks</span>
              </span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto fade-left delay-200">
              Specialized AI assistants built for specific trades. Each one trained to understand your industry inside
              and out.
            </p>
          </div>

          {/* Available Now - Landscaping */}
          <div className="mb-8 sm:mb-12 lg:mb-20">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-full px-6 py-3 text-blue-300 font-semibold fade-left delay-400">
                <CheckCircle className="w-5 h-5" />
                <span>Available Now</span>
              </span>
            </div>

            <div className="w-full relative">
              <div className="relative z-10">
                {/* Text Content with padding */}
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-4 fade-left delay-600">
                      <span className="bg-gradient-to-r from-emerald-500 to-green-700 bg-clip-text text-transparent font-cursive">
                        Ready when you are
                      </span>
                    </h3>
                    <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 fade-left delay-800">
                      Your Full Time AI Landscaping Business Partner
                    </p>
                  </div>
                </div>

                {/* Demo Video - Near Full Width (outside padded container) */}
                <div className="mb-12 fade-left delay-1000 relative">
                  {/* Live Badge - Positioned outside container but relative to it */}
                  <div className="absolute -top-3 right-2 sm:right-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full transform rotate-12 shadow-lg animate-pulse z-20">
                    🟢 LIVE NOW
                  </div>
                  <div className="relative w-full max-w-7xl mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20">
                    <video 
                      ref={(video) => {
                        if (video) {
                          let playTimeout: NodeJS.Timeout;
                          const observer = new IntersectionObserver(
                            (entries) => {
                              entries.forEach((entry) => {
                                if (entry.isIntersecting) {
                                  // Debounce play calls to prevent rapid toggling
                                  clearTimeout(playTimeout);
                                  playTimeout = setTimeout(() => {
                                    video.play().catch(() => {
                                      // Fallback for browsers that require user interaction
                                      video.muted = true;
                                      video.play();
                                    });
                                  }, 500); // Increased delay to 500ms for less aggressive autoplay
                                } else {
                                  clearTimeout(playTimeout);
                                  video.pause();
                                }
                              });
                            },
                            { 
                              threshold: 0.3, // Much lower threshold - video stays playing when 30% visible
                              rootMargin: '0px 0px -100px 0px' // Add some margin so it doesn't pause too early
                            }
                          );
                          observer.observe(video);
                          return () => {
                            clearTimeout(playTimeout);
                            observer.unobserve(video);
                          };
                        }
                      }}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src="/ai-sidekick-demo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Enhanced Value Props Below Video */}
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 md:mt-12 mb-6 sm:mb-8 fade-left delay-1200">
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

                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="space-y-6 fade-left delay-1400">
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
        </div>
        </div>
      </section>


      {/* Testimonial Carousel Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-black">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4 fade-left delay-0">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Success Stories
            </span>
          </h2>
          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto fade-left delay-200">
            See how landscaping pros are transforming their businesses with AI-Sidekick
          </p>
        </div>
        <TestimonialCarousel />
      </section>

      {/* Idea Ticker Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-black overflow-hidden">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 fade-left delay-0">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Get Inspired
            </span>
          </h2>
          <p className="text-gray-300 text-lg fade-left delay-200">
            Real questions from successful landscaping business owners
          </p>
        </div>

        {/* Ticker Row 1 - Scrolling Right */}
        <div className="relative mb-4 ticker-row fade-left delay-400">
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
        <div className="relative mb-4 ticker-row fade-right delay-600">
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
        <div className="relative ticker-row fade-left delay-800">
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
        <div className="text-center mt-12 mb-8 fade-left delay-1000">
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
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6 fade-left delay-0">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                How <span className="font-cursive">AI Sidekick</span> Works
              </span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto fade-left delay-200">
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
                  className="flex items-start space-x-6 group hover:scale-105 transition-all duration-300 fade-left"
                  style={{ animationDelay: `${400 + (index * 200)}ms` }}
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

            {/* Demo Video - Competitive Intelligence */}
            <div className="relative mt-8 lg:mt-0 fade-right delay-600">
              <div className="w-full max-w-4xl mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20">
                <video 
                  ref={(video) => {
                    if (video) {
                      const observer = new IntersectionObserver(
                        (entries) => {
                          entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                              video.play().catch(() => {
                                // Fallback for browsers that require user interaction
                              })
                            } else {
                              video.pause()
                            }
                          })
                        },
                        { threshold: 0.75 } // 75% visibility
                      )
                      observer.observe(video)
                      return () => observer.disconnect()
                    }
                  }}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                >
                  <source src="/demo-video-get-started.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced AI Capabilities Section */}
      <section className="py-16 sm:py-24 lg:py-32 relative bg-black w-full">
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-medium mb-4 sm:mb-6 fade-left delay-0">
              <span className="text-white">Please. Don't use generic search anymore.</span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 max-w-4xl xl:max-w-6xl mx-auto mb-16 lg:mb-20 fade-left delay-400">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-cursive text-2xl xl:text-3xl 2xl:text-4xl">AI Sidekicks</span> are built for your trade — with answers tailored to how your business actually works.
            </p>
          </div>

          {/* Image and Video Comparison */}
          <div className="max-w-[1800px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left - Image */}
              <div className="flex justify-center fade-left delay-800">
                <img 
                  src="/google-search-800.png" 
                  alt="Generic Google Search Results" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              
              {/* Right - Video */}
              <div className="flex justify-center fade-right delay-1200">
                <video 
                  ref={(video) => {
                    if (video) {
                      const observer = new IntersectionObserver(
                        (entries) => {
                          entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                              video.play().catch(() => {
                                // Fallback for browsers that require user interaction
                              })
                            } else {
                              video.pause()
                            }
                          })
                        },
                        { threshold: 0.5 } // 50% visibility
                      )
                      observer.observe(video)
                      return () => observer.disconnect()
                    }
                  }}
                  loop 
                  muted 
                  playsInline
                  className="w-full h-auto rounded-2xl shadow-2xl border border-emerald-500/20"
                >
                  <source src="/google-search-compare-new.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          {/* Footer Block */}
          <div className="text-center mt-16 lg:mt-20 xl:mt-24">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-4 lg:mb-6">
              Every <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-cursive">AI Sidekick</span> is trained like a business consultant — just for your trade.
            </h3>
            <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-200 mb-8 lg:mb-10 max-w-3xl mx-auto">
              The first is <span className="bg-gradient-to-r from-emerald-400 to-emerald-800 bg-clip-text text-transparent font-cursive text-xl xl:text-2xl 2xl:text-3xl">Scout</span>, our landscaping AI sidekick. More trades coming soon.
            </p>
            
            <Button 
              onClick={() => window.location.href = '/signup'}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-base sm:text-lg lg:text-xl xl:text-2xl px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 lg:py-6 xl:py-8 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 max-w-full min-h-[44px] sm:min-h-[52px] lg:min-h-[56px]"
            >
              <span className="truncate">
                Explore <span className="font-cursive text-xl sm:text-2xl lg:text-3xl xl:text-4xl">Scout</span>
              </span>
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
      <section className="py-16 sm:py-24 lg:py-32 relative bg-black w-full scroll-animate">
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
      <section id="pricing" className="py-16 md:py-32 bg-black w-full scroll-animate scale-up">
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
        className="py-16 sm:py-24 lg:py-32 bg-black w-full scroll-animate"
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 sm:max-w-7xl sm:mx-auto xl:max-w-none relative z-10">
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

            <div className="flex space-x-8 text-gray-300 relative z-10">
              <a href="/terms" className="hover:text-white transition-all duration-300 hover:scale-105 inline-block">
                Terms
              </a>
              <a href="/privacy" className="hover:text-white transition-all duration-300 hover:scale-105 inline-block">
                Privacy
              </a>
              <a href="/contact" className="hover:text-white transition-all duration-300 hover:scale-105 inline-block">
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
