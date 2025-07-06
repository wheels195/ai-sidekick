"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  X,
  LogOut,
  ChevronDown,
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
  reaction?: string
}

interface MessageReaction {
  messageId: string
  reaction: string
  timestamp: Date
}

const EMOJI_REACTIONS = [
  { emoji: '🔥', label: 'Fire - This is excellent!' },
  { emoji: '💡', label: 'Lightbulb - Very helpful insight!' },
  { emoji: '👍', label: 'Thumbs up - Good advice' },
  { emoji: '😕', label: 'Confused - Not quite what I needed' }
]

export default function LandscapingChat() {
  const router = useRouter()
  const [user, setUser] = useState<{email: string, businessName: string} | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
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
  const [reactions, setReactions] = useState<Record<string, string>>({})
  const [conversationStartTime] = useState(new Date())
  const [messageCount, setMessageCount] = useState(1)
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const [hasRatedConversation, setHasRatedConversation] = useState(false)
  const [showHelpPanel, setShowHelpPanel] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [placeholderText, setPlaceholderText] = useState("")
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Mobile-friendly shorter suggestions for better UX
  const placeholderSuggestions = [
    "Ask me anything",
    "How can I get more local customers?",
    "What should I charge for maintenance?",
    "Help me with spring cleanup content",
    "How do I rank higher on Google?",
    "What winter services should I offer?",
    "How can I get more 5-star reviews?",
    "Help me create a quote template",
    "What's the best way to upsell?",
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
    const scrollContainer = document.querySelector('.messages-scroll-container')
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    } else {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      })
    }
  }

  // Auto-resize textarea when input changes - smooth and responsive
  useEffect(() => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea && input) {
      const maxHeight = window.innerWidth < 640 ? 120 : 150
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = newHeight + 'px'
      
      // Manage overflow dynamically
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto'
        textarea.classList.add('scrollbar-thin', 'scrollbar-track-transparent', 'scrollbar-thumb-emerald-500/20')
      } else {
        textarea.style.overflowY = 'hidden'
        textarea.classList.remove('scrollbar-thin', 'scrollbar-track-transparent', 'scrollbar-thumb-emerald-500/20')
      }
    }
  }, [input])

  useEffect(() => {
    // Scroll to top when page loads and detect mobile
    window.scrollTo(0, 0)
    setIsMobile(window.innerWidth < 640)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Only scroll to bottom when a new message is added, not on initial load or typing
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages.length]) // Changed dependency to messages.length instead of messages

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUser({
            email: data.user.email,
            businessName: data.user.businessName || 'Your Business'
          })
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showUserMenu && !target.closest('.relative')) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Force redirect even if API fails
      router.push('/login')
    }
  }

  const handleConversationRating = async (rating: number) => {
    setHasRatedConversation(true)
    setShowRatingPrompt(false)
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'conversation_rating',
          rating,
          conversationLength: messages.length,
          conversationDuration: Date.now() - conversationStartTime.getTime(),
          messageCount
        }),
      })
    } catch (error) {
      console.error('Failed to send conversation rating:', error)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    // Update local state immediately for good UX
    setReactions(prev => ({ ...prev, [messageId]: emoji }))
    
    try {
      // Send feedback to API
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          reaction: emoji,
          type: 'emoji_reaction',
          conversationLength: messages.length,
          conversationDuration: Date.now() - conversationStartTime.getTime()
        }),
      })
    } catch (error) {
      console.error('Failed to send reaction:', error)
      // Revert on error
      setReactions(prev => {
        const updated = { ...prev }
        delete updated[messageId]
        return updated
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // ① Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setMessageCount(prev => prev + 1)

    // ② Create empty assistant message for streaming
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ])

    try {
      // Call our streaming API endpoint
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

      if (!response.ok || !response.body) {
        throw new Error(`API request failed: ${response.status}`)
      }

      // ③ Read the SSE stream chunk-by-chunk
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ""
      let finalMessageId = null
      let sessionId = null

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6) // Remove 'data: ' prefix
            
            // Check for completion signal
            if (content.startsWith('[DONE:')) {
              const parts = content.match(/\[DONE:([^:]*):([^\]]*)\]/)
              if (parts) {
                finalMessageId = parts[1] !== 'null' ? parts[1] : null
                sessionId = parts[2]
              }
              break
            }
            
            // Regular content token
            if (content.trim()) {
              assistantText += content
              
              // ④ Update the assistant message in real-time
              setMessages(prev => {
                const idx = prev.findIndex(m => m.id === assistantId)
                if (idx === -1) return prev
                const updated = [...prev]
                updated[idx] = { 
                  ...updated[idx], 
                  content: assistantText,
                  id: finalMessageId || assistantId // Update with database ID when available
                }
                return updated
              })
            }
          }
        }
      }

      // ⑤ Final update with database ID if available
      if (finalMessageId) {
        setMessages(prev => {
          const idx = prev.findIndex(m => m.id === assistantId)
          if (idx === -1) return prev
          const updated = [...prev]
          updated[idx] = { ...updated[idx], id: finalMessageId }
          return updated
        })
      }

      setMessageCount(prev => {
        const newCount = prev + 1
        // Show rating prompt after 6+ messages (3+ exchanges) and not already rated
        if (newCount >= 6 && !hasRatedConversation && !showRatingPrompt) {
          setTimeout(() => setShowRatingPrompt(true), 2000) // Delay to not interrupt reading
        }
        return newCount
      })

    } catch (error) {
      console.error('Chat API Error:', error)
      
      // Remove the empty assistant message and show error
      setMessages(prev => prev.filter(m => m.id !== assistantId))
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
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
    <div className="h-screen bg-gradient-to-br from-black via-gray-950 to-black relative flex flex-col overflow-hidden">
      {/* Background Elements - Behind everything */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/35 to-indigo-500/35 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      {/* Fixed Header - Your Original Design */}
      <header className="flex-shrink-0 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl relative z-50">
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

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpPanel(true)}
                className="text-xs sm:text-sm text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2 border border-emerald-500/30 sm:border-0"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="sm:hidden">Tips</span>
                <span className="hidden sm:inline">Tips</span>
              </Button>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2 flex items-center space-x-1 sm:space-x-2"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline max-w-20 truncate">{user?.businessName || 'User'}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-lg shadow-2xl z-50">
                    <div className="p-3 border-b border-gray-600/30">
                      <p className="text-sm text-white font-medium truncate">{user?.businessName || 'Your Business'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area - Full Height with Internal Scroll */}
      <div className="flex-1 flex flex-col relative z-40 overflow-hidden">
        {/* Chat Messages Container - Your Original Card Design */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl h-full flex flex-col overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full overflow-hidden">
              {/* Messages Area - Internal Scroll */}
              <div 
                className="messages-scroll-container flex-1 overflow-y-scroll p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-emerald-500/20" 
                style={{
                  scrollBehavior: 'smooth'
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`group flex items-start space-x-2 sm:space-x-4 ${
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
                          <div className="text-base leading-relaxed prose prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                h1: ({children}) => <h1 className="text-2xl font-bold text-emerald-300 mb-4 mt-6 first:mt-0 border-b border-emerald-400/30 pb-2">{children}</h1>,
                                h2: ({children}) => <h2 className="text-xl font-bold text-emerald-300 mb-4 mt-6 first:mt-0">{children}</h2>,
                                h3: ({children}) => <h3 className="text-lg font-semibold text-emerald-400 mb-3 mt-5 first:mt-0">{children}</h3>,
                                h4: ({children}) => <h4 className="text-base font-semibold text-emerald-400 mb-2 mt-4 first:mt-0">{children}</h4>,
                                ul: ({children}) => <ul className="list-disc list-outside space-y-3 mb-5 ml-6 text-gray-200 text-base">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-outside space-y-3 mb-5 ml-6 text-gray-200 text-base">{children}</ol>,
                                li: ({children}) => <li className="text-gray-200 leading-relaxed text-base">{children}</li>,
                                p: ({children}) => <p className="mb-4 last:mb-0 text-gray-200 leading-relaxed text-base">{children}</p>,
                                strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                                em: ({children}) => <em className="italic text-gray-300">{children}</em>,
                                code: ({children}) => <code className="bg-gray-700/80 px-2 py-1 rounded text-emerald-300 text-sm font-mono">{children}</code>,
                                pre: ({children}) => <pre className="bg-gray-800/50 p-4 rounded-lg my-4 overflow-x-auto border border-gray-600/50">{children}</pre>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-emerald-400 pl-4 my-4 italic text-gray-300 bg-gray-800/30 py-2 rounded-r">{children}</blockquote>,
                                a: ({children, href}) => <a href={href} className="text-emerald-400 hover:text-emerald-300 underline transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                                table: ({children}) => <table className="w-full border-collapse border border-gray-600 my-4">{children}</table>,
                                th: ({children}) => <th className="border border-gray-600 px-3 py-2 bg-gray-700 text-emerald-300 font-semibold text-left">{children}</th>,
                                td: ({children}) => <td className="border border-gray-600 px-3 py-2 text-gray-200">{children}</td>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Emoji Reactions - Only for assistant messages */}
                      {message.role === "assistant" && (
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {EMOJI_REACTIONS.map(({ emoji, label }) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                title={label}
                                className={`text-lg hover:scale-125 transition-all duration-200 p-1 rounded-full hover:bg-white/10 ${
                                  reactions[message.id] === emoji 
                                    ? 'bg-emerald-500/20 scale-110' 
                                    : ''
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      )}
                      
                      {/* Timestamp for user messages */}
                      {message.role === "user" && (
                        <p className="text-xs text-gray-400 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
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

              {/* Conversation Rating Prompt */}
              {showRatingPrompt && (
                <div className="px-4 py-3 border-t border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-emerald-300 font-medium">How's this chat going?</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleConversationRating(star)}
                            className="text-lg hover:scale-110 transition-all duration-200 text-gray-400 hover:text-yellow-400"
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRatingPrompt(false)}
                      className="text-gray-400 hover:text-gray-300 text-sm"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area - Your Original Design */}
              <div className="px-4 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 border-t border-white/10 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-end space-x-3 sm:space-x-4">
                  <div className="flex-1 relative">
                    <Textarea
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value)
                        // Smooth auto-resize textarea
                        const target = e.target as HTMLTextAreaElement
                        const maxHeight = window.innerWidth < 640 ? 120 : 150 // Responsive max height
                        target.style.height = 'auto'
                        const newHeight = Math.min(target.scrollHeight, maxHeight)
                        target.style.height = newHeight + 'px'
                        
                        // Only show scrollbar if content exceeds max height
                        if (target.scrollHeight > maxHeight) {
                          target.style.overflowY = 'auto'
                        } else {
                          target.style.overflowY = 'hidden'
                        }
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
                          ? "Ask me anything about growing your business..."
                          : placeholderText
                      }
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25 pr-10 sm:pr-12 py-3 sm:py-4 lg:py-5 text-base sm:text-base lg:text-lg backdrop-blur-sm touch-manipulation resize-none min-h-[2.75rem] sm:min-h-[3rem] lg:min-h-[3.5rem] max-h-[120px] sm:max-h-[150px] overflow-hidden hover:overflow-y-auto focus:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-emerald-500/20 w-full leading-relaxed"
                      style={{ fontSize: isMobile ? '16px' : undefined }}
                      rows={1}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Sparkles className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 px-3 sm:px-4 lg:px-5 py-3 sm:py-4 lg:py-5 touch-manipulation flex-shrink-0 h-[2.75rem] sm:h-[3rem] lg:h-[3.5rem] flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </Button>
                </form>

                <p className="text-xs text-gray-500 mt-3 text-center leading-relaxed">
                  Powered by specialized AI trained for landscaping businesses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Panel - Slide out from right */}
      {showHelpPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHelpPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-96 lg:w-[28rem] bg-gradient-to-br from-gray-900 via-gray-950 to-black border-l border-white/10 shadow-2xl overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Tips & Guidance</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpPanel(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Panel Content */}
            <div className="p-4 space-y-6">
              {/* Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Get Started</h3>
                </div>
                
                <label className="flex items-center space-x-3 text-sm bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-300 hover:text-emerald-200 transition-all duration-300 cursor-pointer">
                  <Upload className="w-4 h-4" />
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

                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">Upload examples:</p>
                  {[
                    { icon: ImageIcon, title: "Landscape Ideas", desc: "Photos of yards or design inspiration", color: "text-blue-400" },
                    { icon: FileText, title: "Pricing Analysis", desc: "Price lists or competitor pricing", color: "text-green-400" },
                    { icon: ImageIcon, title: "Problem Diagnosis", desc: "Plant diseases or lawn issues", color: "text-purple-400" },
                    { icon: FileText, title: "Contract Review", desc: "Proposals or service agreements", color: "text-orange-400" },
                  ].map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center space-x-2 mb-1">
                        <item.icon className={`w-3 h-3 ${item.color}`} />
                        <span className="text-sm font-medium text-white">{item.title}</span>
                      </div>
                      <p className="text-xs text-gray-300">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Try asking:</h3>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(question)
                        setShowHelpPanel(false)
                      }}
                      className="w-full text-left text-sm bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Get Better Answers</h3>
                </div>
                
                <p className="text-gray-300 text-sm">
                  The more context you provide, the better I can help your landscaping business:
                </p>

                <div className="space-y-3">
                  {[
                    { icon: "📍", title: "Share Your Location", desc: "City/state for local SEO tips" },
                    { icon: "📊", title: "Describe Your Business", desc: "Services, team size, target customers" },
                    { icon: "🎯", title: "Be Specific About Goals", desc: "More leads, higher prices, new services" },
                    { icon: "📈", title: "Share Current Challenges", desc: "What's not working for you" },
                    { icon: "💰", title: "Mention Your Budget", desc: "Marketing budget or investment capacity" },
                    { icon: "📅", title: "Include Timeframes", desc: "Deadlines or seasonal needs" },
                  ].map((tip, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">{tip.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{tip.title}</h4>
                          <p className="text-xs text-gray-300">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Common Questions</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { q: "What can you help with?", a: "Business growth, local SEO, content creation, pricing strategies, seasonal planning, customer retention, and marketing for landscaping businesses." },
                    { q: "How to get better local SEO advice?", a: "Always mention your city, state, service areas, and target keywords. More location details = better recommendations." },
                    { q: "Can you write content?", a: "Yes! Blog posts, service pages, social media, emails, and Google My Business posts. Tell me your audience and services." },
                    { q: "Help with pricing?", a: "I provide value-based pricing strategies, service bundling, and customer communication scripts to raise prices without losing customers." },
                  ].map((faq, index) => (
                    <details key={index} className="bg-white/5 rounded-lg border border-white/10">
                      <summary className="p-3 cursor-pointer text-white font-medium text-sm hover:text-emerald-400">
                        {faq.q}
                      </summary>
                      <div className="px-3 pb-3">
                        <p className="text-xs text-gray-300">{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Pro Tip */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                <div className="flex items-start space-x-3">
                  <Leaf className="w-4 h-4 text-emerald-400 mt-1" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Pro Tip</h4>
                    <p className="text-xs text-gray-300">
                      Start with business context: "I run a 3-person landscaping crew in Austin, Texas, focusing on residential lawn care. We charge $50/hour but competitors charge $75. How can I justify higher prices?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
