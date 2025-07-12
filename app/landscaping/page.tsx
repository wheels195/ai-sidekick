"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
// Removed ReactMarkdown to fix hydration issues
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

// Enhanced markdown-to-HTML converter with checklist support
const convertMarkdownToHtml = (markdown: string): string => {
  const lines = markdown.split('\n')
  const htmlLines = []
  let inNumberedList = false
  let inBulletList = false
  let inCheckList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line === '') {
      // Close any open lists on empty lines
      if (inNumberedList) {
        htmlLines.push('</ol>')
        inNumberedList = false
      }
      if (inBulletList) {
        htmlLines.push('</ul>')
        inBulletList = false
      }
      if (inCheckList) {
        htmlLines.push('</ul>')
        inCheckList = false
      }
      htmlLines.push('<div class="mb-3"></div>')
      continue
    }
    
    // Headers
    if (line.startsWith('### ')) {
      if (inNumberedList) { htmlLines.push('</ol>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      htmlLines.push(`<h3 class="text-lg font-semibold text-emerald-400 mt-5 mb-2">${line.substring(4)}</h3>`)
    }
    else if (line.startsWith('## ')) {
      if (inNumberedList) { htmlLines.push('</ol>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      htmlLines.push(`<h2 class="text-xl font-bold text-emerald-300 mt-6 mb-3">${line.substring(3)}</h2>`)
    }
    else if (line.startsWith('# ')) {
      if (inNumberedList) { htmlLines.push('</ol>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      htmlLines.push(`<h1 class="text-2xl font-bold text-emerald-200 mt-6 mb-4">${line.substring(2)}</h1>`)
    }
    // Checklist items with emerald checkmarks
    else if (line.match(/^[-*]\s*\[[ x]\]/)) {
      if (inNumberedList) { htmlLines.push('</ol>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (!inCheckList) {
        htmlLines.push('<ul class="space-y-2 mb-4 ml-2">')
        inCheckList = true
      }
      const isChecked = line.includes('[x]') || line.includes('[X]')
      const text = line.replace(/^[-*]\s*\[[ xX]\]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      const checkmark = isChecked 
        ? '<span class="text-emerald-400 text-lg mr-2">✓</span>' 
        : '<span class="text-gray-500 text-lg mr-2">☐</span>'
      htmlLines.push(`<li class="text-white leading-relaxed flex items-start">${checkmark}<span class="flex-1">${text}</span></li>`)
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (!inNumberedList) {
        htmlLines.push('<ol class="space-y-2 mb-4 ml-6 list-decimal list-outside">')
        inNumberedList = true
      }
      const text = line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      htmlLines.push(`<li class="text-white leading-relaxed">${text}</li>`)
    }
    // Bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inNumberedList) { htmlLines.push('</ol>'); inNumberedList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (!inBulletList) {
        htmlLines.push('<ul class="space-y-2 mb-4 ml-6 list-disc list-outside">')
        inBulletList = true
      }
      const text = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      htmlLines.push(`<li class="text-white leading-relaxed">${text}</li>`)
    }
    // Regular paragraphs
    else {
      if (inNumberedList) { htmlLines.push('</ol>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      const text = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      
      // Check if this is an ending question (contains ? and appears to be a question)
      if (text.includes('?') && (text.toLowerCase().includes('what') || text.toLowerCase().includes('how') || text.toLowerCase().includes('which') || text.toLowerCase().includes('where') || text.toLowerCase().includes('when') || text.toLowerCase().includes('why') || text.toLowerCase().includes('would') || text.toLowerCase().includes('could') || text.toLowerCase().includes('should') || text.toLowerCase().includes('do you') || text.toLowerCase().includes('have you') || text.toLowerCase().includes('are you'))) {
        htmlLines.push(`<p class="text-emerald-400 font-medium leading-relaxed mb-3 mt-4">${text}</p>`)
      } else {
        htmlLines.push(`<p class="text-white leading-relaxed mb-3">${text}</p>`)
      }
    }
  }
  
  // Close any remaining lists
  if (inNumberedList) htmlLines.push('</ol>')
  if (inBulletList) htmlLines.push('</ul>')
  if (inCheckList) htmlLines.push('</ul>')
  
  return htmlLines.join('\n')
}

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

// Helper function to generate personalized greeting
const generatePersonalizedGreeting = (user: {
  email: string, 
  businessName: string,
  location: string,
  trade: string,
  services: string[],
  teamSize: number,
  targetCustomers: string,
  yearsInBusiness: number,
  mainChallenges: string[]
} | null): string => {
  const baseGreeting = "Hi! I'm **Dirt.i**, your Landscaping AI Sidekick. I'm here to help you grow your landscaping business with expert advice on SEO, content creation, upselling strategies, and more.\n\n💡 **Pro tip:** Click the Tips button below for guidance on getting the most detailed and actionable responses.\n\n"
  
  if (!user) {
    return baseGreeting + "What can I help you with today?"
  }

  const { businessName, location, services, teamSize } = user
  
  let personalizedContext = `I see you're ${businessName}`
  
  if (location) {
    personalizedContext += ` located in ${location}`
  }
  
  if (teamSize && teamSize > 0) {
    personalizedContext += ` with a ${teamSize}-person team`
  }
  
  if (services && services.length > 0) {
    if (services.length <= 4) {
      personalizedContext += ` offering ${services.join(', ')}`
    } else {
      personalizedContext += ` offering ${services.slice(0, 4).join(', ')}, and more`
    }
  }
  
  personalizedContext += ". What can I help you with today?"
  
  return baseGreeting + personalizedContext
}

export default function LandscapingChat() {
  const router = useRouter()
  const [user, setUser] = useState<{
    email: string, 
    businessName: string,
    location: string,
    trade: string,
    services: string[],
    teamSize: number,
    targetCustomers: string,
    yearsInBusiness: number,
    mainChallenges: string[]
  } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: generatePersonalizedGreeting(null), // Default greeting until user profile loads
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
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSearching, setIsSearching] = useState(false)
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
          const userProfile = {
            email: data.user.email,
            businessName: data.user.businessName || 'Your Business',
            location: data.user.location || '',
            trade: data.user.trade || 'landscaping',
            services: data.user.services || [],
            teamSize: data.user.teamSize || 0,
            targetCustomers: data.user.targetCustomers || '',
            yearsInBusiness: data.user.yearsInBusiness || 0,
            mainChallenges: data.user.mainChallenges || []
          }
          setUser(userProfile)
          
          // Update initial message with personalized greeting
          const personalizedGreeting = generatePersonalizedGreeting(userProfile)
          setMessages([{
            id: "1",
            role: "assistant",
            content: personalizedGreeting,
            timestamp: new Date(),
          }])
        } else if (response.status === 401) {
          // User not authenticated - use mock test data for development
          console.log('User not authenticated, loading mock test user for development')
          
          const mockUserProfile = {
            email: 'test@johnsonlandscaping.com',
            businessName: "Johnson's Landscaping",
            location: 'Dallas, TX',
            trade: 'landscaping',
            services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation'],
            teamSize: 4,
            targetCustomers: 'residential homeowners',
            yearsInBusiness: 8,
            mainChallenges: ['finding new customers', 'pricing competition', 'seasonal cash flow']
          }
          setUser(mockUserProfile)
          
          // Update initial message with personalized greeting using mock data
          const personalizedGreeting = generatePersonalizedGreeting(mockUserProfile)
          setMessages([{
            id: "1",
            role: "assistant",
            content: personalizedGreeting,
            timestamp: new Date(),
          }])
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // Load mock user on network errors too for testing
        const mockUserProfile = {
          email: 'test@johnsonlandscaping.com',
          businessName: "Johnson's Landscaping",
          location: 'Dallas, TX',
          trade: 'landscaping',
          services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation'],
          teamSize: 4,
          targetCustomers: 'residential homeowners',
          yearsInBusiness: 8,
          mainChallenges: ['finding new customers', 'pricing competition', 'seasonal cash flow']
        }
        setUser(mockUserProfile)
        
        const personalizedGreeting = generatePersonalizedGreeting(mockUserProfile)
        setMessages([{
          id: "1",
          role: "assistant",
          content: personalizedGreeting,
          timestamp: new Date(),
        }])
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
    const personalizedGreeting = generatePersonalizedGreeting(user)
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: personalizedGreeting,
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

    // Check if web search might be triggered
    if (webSearchEnabled) {
      const userQuery = input.trim().toLowerCase()
      const searchTriggers = [
        'price', 'cost', 'charge', 'supplier', 'vendor', 'near me', 'local', 
        'current', 'latest', 'now', 'today', 'regulation', 'permit', 'law',
        'competition', 'competitor', 'market rate', 'going rate', 'best'
      ]
      const shouldSearch = searchTriggers.some(trigger => userQuery.includes(trigger))
      if (shouldSearch) {
        setIsSearching(true)
      }
    }

    // ② Create assistant message placeholder for streaming
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ])

    try {
      // Call our streaming API endpoint with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          webSearchEnabled: webSearchEnabled
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

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
      let firstTokenReceived = false

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawContent = line.slice(6) // Remove 'data: ' prefix
            
            // Check for completion signal
            if (rawContent.startsWith('[DONE:')) {
              const parts = rawContent.match(/\[DONE:([^:]*):([^\]]*)\]/)
              if (parts) {
                finalMessageId = parts[1] !== 'null' ? parts[1] : null
                sessionId = parts[2]
              }
              break
            }
            
            // Parse JSON-encoded content to preserve newlines and empty strings
            try {
              const content = JSON.parse(rawContent)
              assistantText += content
              
              // Hide search indicator once first token is received
              if (!firstTokenReceived && content.length > 0) {
                setIsSearching(false)
                firstTokenReceived = true
              }
              
              // Real-time streaming updates with throttling
              const now = Date.now()
              if (now - lastUpdateTime > 50) { // Throttle to 50ms
                setMessages(prev => {
                  const idx = prev.findIndex(m => m.id === assistantId)
                  if (idx === -1) return prev
                  const updated = [...prev]
                  updated[idx] = { ...updated[idx], content: assistantText }
                  return updated
                })
                lastUpdateTime = now
              }
            } catch (e) {
              // Fallback for non-JSON content
              assistantText += rawContent
              
              // Hide search indicator on first content
              if (!firstTokenReceived && rawContent.length > 0) {
                setIsSearching(false)
                firstTokenReceived = true
              }
              
              // Real-time streaming updates with throttling
              const now = Date.now()
              if (now - lastUpdateTime > 50) { // Throttle to 50ms
                setMessages(prev => {
                  const idx = prev.findIndex(m => m.id === assistantId)
                  if (idx === -1) return prev
                  const updated = [...prev]
                  updated[idx] = { ...updated[idx], content: assistantText }
                  return updated
                })
                lastUpdateTime = now
              }
            }
          }
        }
      }

      // ⑤ Final update with complete content and database ID
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

      // Reset search indicator
      setIsSearching(false)

    } catch (error) {
      console.error('Chat API Error:', error)
      
      // Remove the empty assistant message and show error
      setMessages(prev => prev.filter(m => m.id !== assistantId))
      
      let errorContent = "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorContent = "The request timed out. The AI service might be busy. Please try again in a moment."
        } else if (error.message.includes('503')) {
          errorContent = "The AI service is temporarily unavailable. Please try again in a few minutes."
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
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
    <>
      <style>{`
        .font-cursive {
          font-family: var(--font-cursive), 'Brush Script MT', cursive;
        }
      `}</style>
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
                onClick={() => (window.location.href = "/")}
                className="text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Home</span>
                <span className="xs:hidden">Back</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Chats</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white font-cursive">Dirt.i</h1>
                <p className="text-xs sm:text-sm text-gray-300">Your Landscaping AI Sidekick</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-white font-cursive">Dirt.i</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Sign In Link - Desktop */}
              {!user && (
                <Button
                  variant="ghost"
                  className="hidden md:inline-flex text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-4 py-2"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
              )}

              {/* User Profile Dropdown */}
              {user && (
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
              )}
              
              <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Online</span>
              </div>

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
      </header>

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
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white font-cursive">
                  Dirt.i
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
              <a
                href="/#features"
                onClick={() => setShowMobileMenu(false)}
                className="text-lg text-gray-200 hover:text-white transition-all duration-300 py-2"
              >
                Features
              </a>
              <a
                href="/#products"
                onClick={() => setShowMobileMenu(false)}
                className="text-lg text-gray-200 hover:text-white transition-all duration-300 py-2"
              >
                Products
              </a>
              <a
                href="/#pricing"
                onClick={() => setShowMobileMenu(false)}
                className="text-lg text-gray-200 hover:text-white transition-all duration-300 py-2"
              >
                Pricing
              </a>
              <a
                href="/#faq"
                onClick={() => setShowMobileMenu(false)}
                className="text-lg text-gray-200 hover:text-white transition-all duration-300 py-2"
              >
                FAQ
              </a>
              
              {/* Conditional Sign In/User Menu */}
              {!user ? (
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
              ) : (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-white font-medium">{user.businessName || 'Test User Business'}</p>
                    <p className="text-xs text-gray-400">{user.email || 'test@example.com'}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start text-lg text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-0 w-full"
                    onClick={() => {
                      setShowMobileMenu(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                          <div 
                            className="text-white"
                            dangerouslySetInnerHTML={{ 
                              __html: convertMarkdownToHtml(message.content) 
                            }}
                          />
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

                {/* Web Search Indicator */}
                {isSearching && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl rounded-bl-md p-4 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                        </div>
                        <span className="text-sm text-blue-300 font-medium">🌐 Searching the web for current information...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading Indicator */}
                {isLoading && !isSearching && (
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
                      {/* File Upload Display */}
                      {uploadedFiles.length > 0 && (
                        <div className="px-4 pt-3 pb-2">
                          <div className="flex flex-wrap gap-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1 text-xs">
                                <span className="text-emerald-300">{file.name}</span>
                                <button
                                  onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                                  className="text-emerald-400 hover:text-emerald-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
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
                        <label className="group p-2 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                          <Paperclip className="w-4 h-4 text-emerald-300" />
                          <span className="text-xs text-emerald-400">
                            Attach
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || [])
                              setUploadedFiles(prev => [...prev, ...files])
                            }}
                            disabled={isLoading}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                          className={`group p-2 rounded-lg transition-colors flex items-center gap-1 ${
                            webSearchEnabled 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : 'hover:bg-emerald-500/10 text-emerald-400'
                          }`}
                          disabled={isLoading}
                          title={webSearchEnabled ? 'Web search enabled' : 'Web search disabled'}
                        >
                          <div className={`w-2 h-2 rounded-full ${webSearchEnabled ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                          <span className="text-xs">
                            Web Search
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowHelpPanel(true)}
                          className="group p-2 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          <span className="text-xs text-emerald-400">
                            Tips
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
          
          {/* Panel - Slide in from right */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-96 lg:w-[28rem] bg-gradient-to-br from-gray-900 via-gray-950 to-black border-l border-white/10 shadow-2xl overflow-y-auto transform transition-all duration-300 ease-out translate-x-0">
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
                  The more context you provide, the better Dirt.i can help your landscaping business:
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
    </>
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
