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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [placeholderText, setPlaceholderText] = useState("")
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Mobile-friendly shorter suggestions for better UX
  const placeholderSuggestions = [
    "Ask me anything about growing your business...",
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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    })
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
    // Scroll to top when page loads
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Only scroll to bottom when a new message is added, not on initial load or typing
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages.length]) // Changed dependency to messages.length instead of messages

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
        id: data.message.id || (Date.now() + 1).toString(), // Use database ID if available
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
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

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area - Full Height with Internal Scroll */}
      <div className="flex-1 flex flex-col min-h-0 relative z-40">
        {/* Chat Messages Container - Your Original Card Design */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6">
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl h-full flex flex-col">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages Area - Internal Scroll */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(16, 185, 129, 0.2) transparent'
              }}>
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
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25 pr-10 sm:pr-12 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg backdrop-blur-sm touch-manipulation resize-none min-h-[2.75rem] sm:min-h-[3rem] lg:min-h-[3.5rem] max-h-[120px] sm:max-h-[150px] overflow-hidden hover:overflow-y-auto focus:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-emerald-500/20 w-full leading-relaxed"
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
    </div>
  )
}
