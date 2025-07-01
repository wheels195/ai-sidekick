"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import {
  ArrowLeft,
  Send,
  Sparkles,
  Leaf,
  TrendingUp,
  MessageSquare,
  User,
  Bot,
  Upload,
  FileText,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function LandscapingChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your Landscaping AI Sidekick. I'm here to help you grow your landscaping business with expert advice on SEO, content creation, upselling strategies, and more. What can I help you with today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [placeholderText, setPlaceholderText] = useState("")
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const placeholderSuggestions = [
    "Ask me anything about growing your landscaping business...",
    "How can I get more local customers?",
    "What should I charge for lawn maintenance?",
    "Help me write a blog post about spring cleanup",
    "How do I rank higher on Google Maps?",
    "What services should I offer in winter?",
    "How can I get more 5-star reviews?",
    "Help me create a quote for tree trimming",
    "What's the best way to upsell customers?",
    "How do I compete with larger companies?",
  ]

  useEffect(() => {
    // Stop animation if user is focused on input, has typed something, or has started chatting
    if (isInputFocused || input.length > 0 || messages.length > 1) {
      return
    }

    let timeout: NodeJS.Timeout

    const typeText = () => {
      const currentSuggestion = placeholderSuggestions[currentSuggestionIndex]

      if (isTyping) {
        // Typing phase
        if (placeholderText.length < currentSuggestion.length) {
          setPlaceholderText(currentSuggestion.slice(0, placeholderText.length + 1))
          timeout = setTimeout(typeText, 50 + Math.random() * 50) // Random typing speed
        } else {
          // Finished typing, wait then start deleting
          timeout = setTimeout(() => setIsTyping(false), 2000)
        }
      } else {
        // Deleting phase
        if (placeholderText.length > 0) {
          setPlaceholderText(placeholderText.slice(0, -1))
          timeout = setTimeout(typeText, 30) // Faster deleting
        } else {
          // Finished deleting, move to next suggestion
          setCurrentSuggestionIndex((prev) => (prev + 1) % placeholderSuggestions.length)
          setIsTyping(true)
          timeout = setTimeout(typeText, 500) // Pause before next suggestion
        }
      }
    }

    timeout = setTimeout(typeText, 100)

    return () => clearTimeout(timeout)
  }, [
    placeholderText,
    currentSuggestionIndex,
    isTyping,
    placeholderSuggestions,
    isInputFocused,
    input.length,
    messages.length,
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    })
  }

  // Auto-resize textarea when input changes
  useEffect(() => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
    }
  }, [input])

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Only scroll to bottom when a new message is added, not on initial load or typing
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages.length]) // Changed dependency to messages.length instead of messages

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call our OpenAI API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat API Error:', error)
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please check that your OpenAI API key is configured correctly and try again. If the problem persists, please refresh the page.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "How can I rank higher for landscaping in my city?",
    "What should I blog about this season?",
    "What services can I upsell to lawn clients?",
    "How do I get more 5-star reviews?",
    "Help me write a service page for tree trimming",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      {/* Background Elements - Behind everything */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/35 to-indigo-500/35 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 w-full z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Home</span>
                <span className="xs:hidden">Back</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => (window.location.href = "/")}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white">Landscaping AI Sidekick</h1>
                <p className="text-xs sm:text-sm text-gray-300">Your expert business growth partner</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-white">AI Sidekick</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Section - Full Screen */}
      <main className="relative z-40 h-[100dvh] pt-14 sm:pt-16 lg:pt-20 touch-manipulation">
        <div className="h-full flex flex-col p-1 sm:p-4 lg:p-6">
          {/* Chat Messages Container - Full Height */}
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl h-full flex flex-col touch-manipulation">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages Area - Takes remaining space */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 sm:space-x-4 ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                          : "bg-gradient-to-br from-emerald-400 to-teal-500"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 min-w-0 ${message.role === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md"
                            : "bg-white/10 backdrop-blur-xl text-gray-100 border border-white/20 rounded-bl-md hover:bg-white/15"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                h1: ({children}) => <h1 className="text-xl font-bold text-emerald-300 mb-4 mt-6 first:mt-0 border-b border-emerald-400/30 pb-2">{children}</h1>,
                                h2: ({children}) => <h2 className="text-lg font-bold text-emerald-300 mb-3 mt-5 first:mt-0">{children}</h2>,
                                h3: ({children}) => <h3 className="text-base font-semibold text-emerald-400 mb-2 mt-4 first:mt-0">{children}</h3>,
                                ul: ({children}) => <ul className="list-disc list-outside space-y-2 mb-4 ml-6 text-gray-200">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-outside space-y-2 mb-4 ml-6 text-gray-200">{children}</ol>,
                                li: ({children}) => <li className="text-gray-200 leading-relaxed">{children}</li>,
                                p: ({children}) => <p className="mb-3 last:mb-0 text-gray-200 leading-relaxed">{children}</p>,
                                strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                                code: ({children}) => <code className="bg-gray-700 px-2 py-1 rounded text-emerald-300 text-sm font-mono">{children}</code>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-emerald-400 pl-4 my-4 italic text-gray-300">{children}</blockquote>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl rounded-bl-md p-4 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-emerald-300 font-medium">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>


              {/* Input Area */}
              <div className="p-3 sm:p-4 lg:p-6 border-t border-white/10 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-4">
                  <div className="flex-1 relative">
                    <Textarea
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value)
                        // Auto-resize textarea
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = Math.min(target.scrollHeight, 150) + 'px'
                      }}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                      placeholder={
                        isInputFocused || input.length > 0 || messages.length > 1
                          ? "Ask me anything about growing your landscaping business..."
                          : placeholderText
                      }
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25 pr-10 sm:pr-12 py-3 sm:py-4 lg:py-6 text-base sm:text-base lg:text-lg backdrop-blur-sm touch-manipulation resize-none min-h-[3rem] max-h-[150px] overflow-y-auto w-full"
                      rows={1}
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 touch-manipulation"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </form>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  Powered by specialized AI trained for landscaping businesses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Additional Content Below Chat */}
      <div className="relative z-10 bg-gradient-to-br from-black via-gray-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
          
          {/* Upload & Suggestions Section */}
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Get Started</h3>
              </div>

              {/* Upload Button */}
              <div className="mb-6">
                <label className="inline-flex items-center space-x-3 text-sm bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 rounded-lg px-6 py-4 text-emerald-300 hover:text-emerald-200 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Upload Document or Image</span>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        console.log("File selected:", file.name)
                      }
                    }}
                  />
                </label>
              </div>

              {/* Upload Examples */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-4">Upload examples:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Landscape Design Ideas</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Upload photos of yards, design inspiration, or current landscapes for improvement suggestions
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Pricing Analysis</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Upload your current price list or competitor pricing for market analysis and recommendations
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">Problem Diagnosis</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Upload photos of plant diseases, pest damage, or lawn issues for identification and treatment advice
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-white">Contract Review</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Upload contracts, proposals, or service agreements for improvement suggestions and best practices
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Questions */}
              <div>
                <p className="text-gray-400 text-sm mb-4">Or try asking:</p>
                <div className="flex flex-wrap gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="text-sm bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: MessageSquare, label: "Expert Advice", value: "24/7" },
              { icon: TrendingUp, label: "Local SEO", value: "Optimized" },
              { icon: Leaf, label: "Industry Focus", value: "100%" },
            ].map((stat, index) => (
              <Card
                key={index}
                className="backdrop-blur-xl bg-white/5 border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <stat.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-semibold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Get More Specific Answers</h3>
              </div>

              <p className="text-gray-200 mb-6">
                The more context you provide, the better I can help your landscaping business. Here are some ways to get
                more targeted advice:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    icon: "📍",
                    title: "Share Your Location",
                    desc: "Tell me your city/state for local SEO tips, seasonal advice, and regional market insights.",
                    example: "I'm a landscaper in Phoenix, Arizona...",
                  },
                  {
                    icon: "📊",
                    title: "Describe Your Business",
                    desc: "Share your services, team size, and target customers for personalized growth strategies.",
                    example: "We're a 5-person team focusing on residential lawn care and tree trimming...",
                  },
                  {
                    icon: "🎯",
                    title: "Be Specific About Goals",
                    desc: "Tell me what you want to achieve - more leads, higher prices, new services, etc.",
                    example: "I want to increase my average job value from $200 to $350...",
                  },
                  {
                    icon: "📈",
                    title: "Share Current Challenges",
                    desc: "Describe what's not working so I can give targeted solutions and improvements.",
                    example: "My Google My Business gets views but no calls...",
                  },
                  {
                    icon: "💰",
                    title: "Mention Your Budget",
                    desc: "Share your marketing budget or investment capacity for realistic recommendations.",
                    example: "I have $500/month for marketing and advertising...",
                  },
                  {
                    icon: "📅",
                    title: "Include Timeframes",
                    desc: "Tell me your deadlines or seasonal needs for time-sensitive advice.",
                    example: "I need to prepare for spring rush season starting in March...",
                  },
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{tip.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                          {tip.title}
                        </h4>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{tip.desc}</p>
                        <div className="bg-gray-700/30 rounded-lg p-3 border-l-4 border-emerald-500/50">
                          <p className="text-xs text-gray-400 italic">Example: "{tip.example}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "What types of landscaping questions can you help with?",
                    a: "I can help with business growth strategies, local SEO, content creation, pricing strategies, seasonal planning, customer retention, upselling techniques, marketing campaigns, Google My Business optimization, review management, and operational efficiency for landscaping businesses.",
                  },
                  {
                    q: "How do I get the most accurate local SEO advice?",
                    a: "Always mention your specific city and state, your main service areas, and your target keywords. For example: 'I'm in Denver, Colorado, serving residential customers within 15 miles, and want to rank for lawn care Denver.' The more location-specific details you provide, the better my recommendations.",
                  },
                  {
                    q: "Can you help me write content for my website and social media?",
                    a: "I can help create blog posts, service page content, social media captions, email newsletters, and Google My Business posts. Just tell me your target audience, services, and any specific topics or seasons you want to focus on.",
                  },
                  {
                    q: "How can you help me increase my prices without losing customers?",
                    a: "I can provide strategies for value-based pricing, service bundling, premium service offerings, and customer communication scripts. Share your current pricing, services, and market position for personalized advice on raising prices while maintaining customer satisfaction.",
                  },
                  {
                    q: "What's the best way to ask about seasonal business strategies?",
                    a: "Tell me your location (for climate-specific advice), your current services, and which season you're preparing for. For example: 'I'm in Chicago and want to maximize revenue during winter months when lawn care slows down.' I can then suggest winter services, preparation strategies, and year-round revenue ideas.",
                  },
                  {
                    q: "Can you help me analyze my competition?",
                    a: "Yes! Share your competitors' names, their services, pricing (if known), and what makes them successful in your area. I can help you identify opportunities to differentiate your business and compete more effectively.",
                  },
                  {
                    q: "How do I get help with customer service and retention issues?",
                    a: "Describe specific customer service challenges you're facing, your current processes, and any recurring complaints or issues. I can provide scripts, processes, and strategies to improve customer satisfaction and retention rates.",
                  },
                  {
                    q: "What if I need help with something not directly related to landscaping?",
                    a: "While I'm specialized for landscaping businesses, I can help with general business topics like hiring, scheduling, invoicing, and basic marketing principles as they apply to your landscaping company. Just be specific about your landscaping business context.",
                  },
                ].map((faq, index) => (
                  <details
                    key={index}
                    className="bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <summary className="p-6 cursor-pointer text-white font-semibold hover:text-emerald-400 transition-colors duration-300 flex items-center justify-between">
                      <span className="text-lg">{faq.q}</span>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-all duration-300">
                        <span className="text-emerald-400 text-sm">+</span>
                      </div>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-200 leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Pro Tip for Best Results</h4>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Start your questions with context about your business, then ask your specific question. For
                      example: "I run a 3-person landscaping crew in Austin, Texas, focusing on residential lawn care
                      and tree trimming. We charge $50/hour but competitors charge $75. How can I justify higher prices
                      to customers?"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
