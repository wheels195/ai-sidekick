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
} from "lucide-react"
import { ModernPricingCard } from "@/components/ui/modern-pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0)
  const [userMessage, setUserMessage] = useState("")
  const [aiMessage, setAiMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [demoStarted, setDemoStarted] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const fullUserMessage = "How can I justify charging more money for jobs in my Atlanta area? I'm a small landscaping company with only 3 employees. What ideas do you have?"
  
  const fullAiMessage = `## Justifying Higher Pricing in the Atlanta Landscaping Market

Charging more for your landscaping services can be a strategic move, especially if you can clearly communicate the value you provide. Here are several actionable strategies to help you justify higher prices in the Atlanta area:

### 1. Highlight Quality and Expertise
**Showcase Experience:** Provide a detailed portfolio highlighting your best work and the expertise of your team. Include before-and-after photos, especially for unique projects.
**Certifications and Training:** If you or your team have received any certifications or training, make these known. It can greatly enhance your credibility.

### 2. Emphasize Customer Service
**Personalized Services:** Offer tailored landscaping solutions that meet the specific needs of your customers. Emphasize your commitment to exceptional customer service and communication.
**Responsive Communication:** Be prompt and clear in your communication. Customers often value companies that are easy to reach and responsive.

### 3. Leverage Local SEO
**Optimize for Local Searches:** Use local keywords relevant to Atlanta (e.g., "premium landscaping in Atlanta") to attract customers looking for high-quality services.
**Google Business Profile:** Optimize your profile with detailed descriptions of services, high-quality images, and customer reviews.

### Next Steps
- Optimize your Google Business Profile with local keywords and images
- Create a premium service package that showcases your best offerings
- Develop a content calendar for blog posts that educate potential customers

What specific services do you currently offer, and what challenges have you faced in pricing your work?`

  useEffect(() => {
    const startDemo = () => {
      // Set user message immediately
      setUserMessage(fullUserMessage)
      setDemoStep(1)
      setAiMessage("")
      
      // Start AI thinking immediately
      setTimeout(() => {
        setDemoStep(2)
        setIsTyping(true)
        
        // Start AI response after 1 second
        setTimeout(() => {
          setIsTyping(false)
          setDemoStep(3)
          let aiIndex = 0
          const typeAiMessage = () => {
            if (aiIndex < fullAiMessage.length) {
              setAiMessage(fullAiMessage.substring(0, aiIndex + 1))
              aiIndex++
              setTimeout(typeAiMessage, 8 + Math.random() * 15) // Much faster AI typing
            } else {
              // AI finished, wait 3 seconds then restart
              setTimeout(() => {
                setDemoStarted(false)
                setTimeout(() => {
                  if (demoStarted) startDemo()
                }, 1000)
              }, 3000)
            }
          }
          typeAiMessage()
        }, 1000)
      }, 500)
    }

    // Intersection Observer to start demo when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !demoStarted) {
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
  }, [demoStarted, fullUserMessage, fullAiMessage])

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
        
        // Check if this is an ending question
        if (text.includes('?') && (text.toLowerCase().includes('what') || text.toLowerCase().includes('how') || text.toLowerCase().includes('which'))) {
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
      `}</style>
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
      <section className="pt-8 sm:pt-16 pb-16 sm:pb-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
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
                title: "Reputation Builder",
                desc: "Turn happy customers into 5-star reviews that build trust and attract new business",
              },
              {
                icon: BarChart3,
                title: "Smart Business Insights",
                desc: "Get clear, AI-driven advice on what to fix, improve, or double down on in your business",
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
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
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
        <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                How AI Sidekick Works
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
                    <h3 className="text-2xl font-medium text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-200 text-lg leading-relaxed">{feature.description}</p>
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

                  {/* AI Response - Only show when typing or complete */}
                  {demoStep >= 3 && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-xl text-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                        <div className="space-y-3 text-sm leading-relaxed">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: convertMarkdownToHtml(aiMessage) 
                            }}
                          />
                          {demoStep === 3 && aiMessage.length > 0 && !aiMessage.includes('What specific services') && (
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
                Our AI Sidekicks
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

            <Card className="backdrop-blur-2xl bg-gray-800/60 border-emerald-500/30 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 max-w-4xl mx-auto hover:bg-gray-800/80">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110">
                    <span className="text-3xl">🌿</span>
                  </div>
                  <h3 className="text-4xl font-semibold text-white mb-4">Landscaping AI Sidekick</h3>
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
                        <h4 className="text-lg font-medium text-white mb-2">{feature.title}</h4>
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

            <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 relative z-10">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-6 py-3 mb-8 hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Coming Soon</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-6">
                  <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                    More AI Sidekicks
                  </span>
                </h2>
                <p className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl text-gray-300 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
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
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Electricians AI</h3>
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
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Plumbers AI</h3>
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
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">HVAC AI</h3>
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
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Roofers AI</h3>
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
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Pest Control AI</h3>
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
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Contractors AI</h3>
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
        <div className="mx-auto max-w-7xl xl:max-w-none px-6 xl:px-12 2xl:px-20">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold mb-4 sm:mb-6 font-inter">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Simple, Honest Pricing
              </span>
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-200 font-inter">
              No tokens. No fluff. Just results for your business.
            </p>
          </div>

          {/* All Plans in a Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 justify-center items-stretch max-w-7xl mx-auto">
            <ModernPricingCard
              planName="Free Trial"
              price="$0"
              description="Test drive our AI sidekicks for 7 days"
              buttonText="Start Free Trial"
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
              planName="Starter"
              price="$19"
              description="Perfect for getting started with AI guidance"
              buttonText="Start with Starter"
              features={[
                "Full access to your trade's AI sidekick",
                "Unlimited questions & conversations",
                "Local SEO guidance",
                "Content generation tools",
                "Email support",
              ]}
              onClick={() => window.location.href = '/signup?plan=starter'}
            />

            <ModernPricingCard
              planName="Advanced"
              price="$59"
              description="Our most advanced AI with real-time web search"
              buttonText="Grow with Advanced"
              isPopular={true}
              badge="Most Popular"
              features={[
                "Everything in Starter Plan",
                "Powered by our most advanced AI model",
                "Real-time web search & research",
                "Latest industry trends & insights",
                "Advanced competitive analysis",
                "Priority support",
              ]}
              onClick={() => window.location.href = '/signup?plan=advanced'}
            />

            <ModernPricingCard
              planName="Sidepiece AI"
              price="Contact Us"
              description="Custom pricing to add on AI sidekicks"
              buttonText="Contact for Pricing"
              badge="Multi-Trades"
              features={[
                "Add multiple AI sidekicks to your current plan",
                "Upgrade from Starter to Advanced anytime",
                "Custom pricing based on your needs",
                "Volume discounts for multiple sidekicks",
                "Priority support for custom plans",
                "Flexible billing and contract terms",
              ]}
              onClick={() => window.location.href = '/signup?plan=sidepiece-ai'}
            />
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
                  {
                    q: "How does the AI learn and get better over time?",
                    a: "Your AI Sidekick uses a smart, two-layer learning system to improve the more you use it — without compromising your privacy.\n\n1. Personalized learning for your business\nAs you chat, the AI adapts to your specific trade, location, services, team size, and how you prefer to communicate. It remembers what kind of advice works for your business and gets more accurate over time.\n\n2. Smarter system-wide improvements (without sharing your info)\nWe also use anonymous, hashed data to spot bigger trends — like what pricing strategies work best for small crews in the Southeast, or which formats (like checklists vs. paragraphs) people find most helpful. This helps everyone get better answers, faster.\n\n3. You're in control of your data\nAll of your data is protected with strong encryption and Row Level Security. Your business info is never shared or used to train outside models, and you can opt out of learning features if you want.\n\n4. Built-in feedback system\nYou can rate answers with a quick emoji or star rating. That helps your Sidekick learn what to improve, and helps us find better ways to support businesses like yours.",
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
      <footer className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-600/30 bg-black">
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
              <a
                href="mailto:hello@aisidekick.com"
                className="hover:text-white transition-all duration-300 hover:scale-105"
              >
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
