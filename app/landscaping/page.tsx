"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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
  ArrowUpIcon,
  Paperclip,
  Menu,
  History,
  Plus,
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

interface SavedConversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

const EMOJI_REACTIONS = [
  { emoji: '🔥', label: 'Fire - This is excellent!' },
  { emoji: '💡', label: 'Lightbulb - Very helpful insight!' },
  { emoji: '👍', label: 'Thumbs up - Good advice' },
  { emoji: '😕', label: 'Confused - Not quite what I needed' }
]

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

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
  const [showSidebar, setShowSidebar] = useState(false)
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [placeholderText, setPlaceholderText] = useState("")
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [isInputFocused, setIsInputFocused] = useState(false)
  
  // Auto-resize textarea hook
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  })

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
        } else if (response.status === 401) {
          // User not authenticated - for now, continue without auth (testing mode)
          console.log('User not authenticated, continuing without user context')
          // router.push('/login') // Disabled for testing
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // Don't redirect on network errors, just continue without user context
      }
    }
    fetchUser()
  }, [router])

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

  // Auto-save conversation when messages change
  useEffect(() => {
    if (messages.length > 1) {
      const timeoutId = setTimeout(() => {
        saveCurrentConversation()
      }, 2000) // Save 2 seconds after last message
      
      return () => clearTimeout(timeoutId)
    }
  }, [messages])

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

  // Save current conversation
  const saveCurrentConversation = () => {
    if (messages.length <= 1) return // Don't save empty conversations
    
    const title = generateConversationTitle(messages)
    const conversationId = currentConversationId || Date.now().toString()
    
    const conversation: SavedConversation = {
      id: conversationId,
      title,
      messages: [...messages],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSavedConversations(prev => {
      const existingIndex = prev.findIndex(c => c.id === conversationId)
      if (existingIndex >= 0) {
        // Update existing conversation
        const updated = [...prev]
        updated[existingIndex] = conversation
        return updated
      } else {
        // Add new conversation
        return [conversation, ...prev]
      }
    })
    
    setCurrentConversationId(conversationId)
  }

  // Generate conversation title from first user message
  const generateConversationTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 50)
      return title.length < firstUserMessage.content.length ? title + '...' : title
    }
    return 'New Conversation'
  }

  // Load a saved conversation
  const loadConversation = (conversation: SavedConversation) => {
    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
    setShowSidebar(false)
  }

  // Start a new conversation
  const startNewConversation = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your Landscaping AI Sidekick. I'm here to help you grow your landscaping business with expert advice on SEO, content creation, upselling strategies, and more. What can I help you with today?",
        timestamp: new Date(),
      },
    ])
    setCurrentConversationId(null)
    setShowSidebar(false)
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

    // ② Create assistant message with thinking indicator
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: "assistant", content: "⌛ Thinking...", timestamp: new Date() },
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
      let lastUpdateTime = 0

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
            
            // Regular content token - collect all content, no UI updates during streaming
            if (content) {
              assistantText += content
              // No UI updates during streaming to prevent React errors
            }
          }
        }
      }

      // ⑤ Final update with complete content and database ID
      console.log('Final assistantText:', assistantText.substring(0, 200) + '...')
      console.log('Has newlines:', assistantText.includes('\n'))
      console.log('Has headers:', assistantText.includes('##'))
      
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === assistantId)
        if (idx === -1) return prev
        const updated = [...prev]
        updated[idx] = { 
          ...updated[idx], 
          content: assistantText,
          id: finalMessageId || assistantId
        }
        return updated
      })

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
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. If the problem persists, please refresh the page.",
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
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Chats</span>
              </Button>
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
                  <span className="hidden sm:inline max-w-20 truncate">{user?.businessName || 'Test User'}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-lg shadow-2xl z-50">
                    <div className="p-3 border-b border-gray-600/30">
                      <p className="text-sm text-white font-medium truncate">{user?.businessName || 'Test User Business'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || 'test@example.com'}</p>
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

      {/* Chat History Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-full sm:w-80 bg-gradient-to-br from-gray-900 via-gray-950 to-black border-r border-white/10 shadow-2xl overflow-y-auto">
            {/* Sidebar Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Chat History</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4 border-b border-white/10">
              <Button
                onClick={startNewConversation}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </Button>
            </div>

            {/* Conversations List */}
            <div className="p-4 space-y-2">
              {savedConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">No conversations yet</p>
                  <p className="text-gray-500 text-xs mt-1">Start chatting to see your history here</p>
                </div>
              ) : (
                savedConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => loadConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      currentConversationId === conversation.id 
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' 
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{conversation.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {conversation.messages.length} messages • {conversation.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
                            : "bg-white/10 backdrop-blur-xl border border-white/20 rounded-bl-md hover:bg-white/15"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="text-white">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-6 mb-4">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-6 mb-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-5 mb-2">{children}</h3>,
                                p: ({ children }) => <p className="text-white leading-relaxed mb-3">{children}</p>,
                                ul: ({ children }) => <ul className="space-y-2 mb-4 ml-6 list-disc list-outside text-white">{children}</ul>,
                                ol: ({ children }) => <ol className="space-y-2 mb-4 ml-6 list-decimal list-outside text-white">{children}</ol>,
                                li: ({ children }) => <li className="text-white leading-relaxed">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-base leading-relaxed whitespace-pre-wrap text-white">{message.content}</p>
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

              {/* Enhanced Input Area with Landscaping Theme */}
              <div className="px-4 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 border-t border-white/10 flex-shrink-0">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="overflow-hidden">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value)
                          adjustHeight()
                        }}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            if (input.trim()) {
                              handleSubmit(e as any)
                              adjustHeight(true)
                            }
                          }
                        }}
                        placeholder={
                          isInputFocused || input.length > 0 || messages.length > 1
                            ? "Ask me anything about growing your landscaping business..."
                            : placeholderText
                        }
                        className="w-full px-4 py-3 resize-none bg-transparent border-none text-white text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 placeholder:text-sm min-h-[60px]"
                        style={{
                          overflow: "hidden",
                          fontSize: isMobile ? '16px' : undefined
                        }}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="group p-2 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Paperclip className="w-4 h-4 text-emerald-300" />
                          <span className="text-xs text-emerald-400 hidden group-hover:inline transition-opacity">
                            Attach
                          </span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`px-1.5 py-1.5 rounded-lg text-sm transition-all duration-300 border flex items-center justify-center ${
                            input.trim() && !isLoading
                              ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
                              : "text-gray-400 border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                          }`}
                          onClick={(e) => {
                            if (input.trim()) {
                              handleSubmit(e as any)
                              adjustHeight(true)
                            }
                          }}
                          disabled={!input.trim() || isLoading}
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowUpIcon className="w-4 h-4" />
                          )}
                          <span className="sr-only">Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Quick Action Suggestions for Landscaping */}
                {messages.length === 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                    <ActionButton
                      icon={<TrendingUp className="w-4 h-4" />}
                      label="Local SEO Tips"
                      onClick={() => {
                        setInput("How can I improve my local SEO for landscaping?")
                        if (textareaRef.current) {
                          textareaRef.current.focus()
                        }
                      }}
                    />
                    <ActionButton
                      icon={<Leaf className="w-4 h-4" />}
                      label="Seasonal Services"
                      onClick={() => {
                        setInput("What services should I offer this season?")
                        if (textareaRef.current) {
                          textareaRef.current.focus()
                        }
                      }}
                    />
                    <ActionButton
                      icon={<MessageSquare className="w-4 h-4" />}
                      label="Content Ideas"
                      onClick={() => {
                        setInput("Help me create content for my landscaping business")
                        if (textareaRef.current) {
                          textareaRef.current.focus()
                        }
                      }}
                    />
                  </div>
                )}

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

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full border border-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-all duration-300 hover:scale-105"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
