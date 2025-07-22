"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
// Removed ReactMarkdown to fix hydration issues
import {
  ArrowLeft,
  Send,
  Sparkles,
  Leaf,
  TrendingUp,
  MessageSquare,
  User,
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
  Copy,
  Check,
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
  modelUsed?: string
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

// Enhanced markdown-to-HTML converter with checklist support and table support
const convertMarkdownToHtml = (markdown: string): string => {
  const lines = markdown.split('\n')
  const htmlLines = []
  let inNumberedList = false
  let inBulletList = false
  let inCheckList = false
  let inTable = false
  let tableHeaders: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line === '') {
      // Close any open lists and tables on empty lines
      if (inNumberedList) {
        htmlLines.push('</div>')
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
      if (inTable) {
        htmlLines.push('</tbody></table></div>')
        inTable = false
        tableHeaders = []
      }
      htmlLines.push('<div class="mb-3"></div>')
      continue
    }
    
    // Table detection and processing
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
      
      if (!inTable) {
        // Start new table
        if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
        if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
        if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
        
        tableHeaders = cells
        htmlLines.push('<div class="overflow-x-auto my-6">')
        htmlLines.push('<table class="min-w-full bg-gray-800/50 border border-gray-600 rounded-lg">')
        htmlLines.push('<thead class="bg-gray-700/50">')
        htmlLines.push('<tr>')
        
        cells.forEach(header => {
          htmlLines.push(`<th class="px-4 py-3 text-left text-emerald-400 font-semibold border-b border-gray-600">${header}</th>`)
        })
        
        htmlLines.push('</tr>')
        htmlLines.push('</thead>')
        htmlLines.push('<tbody>')
        inTable = true
      } else {
        // Skip separator line (contains dashes)
        if (cells.every(cell => cell.match(/^[-:]+$/))) {
          continue
        }
        
        // Add table row
        htmlLines.push('<tr class="border-b border-gray-700 hover:bg-gray-700/30">')
        
        cells.forEach((cell, index) => {
          // Handle bold text in cells - enhanced processing
          let processedCell = cell.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
          // Handle links in cells
          processedCell = processedCell.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
          
          htmlLines.push(`<td class="px-4 py-3 text-white">${processedCell}</td>`)
        })
        
        htmlLines.push('</tr>')
      }
    }
    // Headers
    else if (line.startsWith('#### ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      htmlLines.push(`<h4 class="text-base font-semibold text-emerald-300 mt-4 mb-2">${line.substring(5)}</h4>`)
    }
    else if (line.startsWith('### ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      htmlLines.push(`<h3 class="text-lg font-semibold text-emerald-400 mt-5 mb-2">${line.substring(4)}</h3>`)
    }
    else if (line.startsWith('## ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      htmlLines.push(`<h2 class="text-xl font-bold text-emerald-300 mt-6 mb-3">${line.substring(3)}</h2>`)
    }
    else if (line.startsWith('# ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      htmlLines.push(`<h1 class="text-2xl font-bold text-emerald-200 mt-6 mb-4">${line.substring(2)}</h1>`)
    }
    // Checklist items with emerald checkmarks
    else if (line.match(/^[-*]\s*\[[ x]\]/)) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
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
    else if (/^\d+\.\s+/.test(line)) {
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      if (!inNumberedList) {
        htmlLines.push('<div class="space-y-3 mb-4">')
        inNumberedList = true
      }
      const number = line.match(/^\d+/)[0]
      let text = line.replace(/^\d+\.\s+/, '')
      // Handle bold text with emerald color for titles - enhanced processing
      text = text.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="font-semibold text-emerald-400">$1</strong>')
      // Handle markdown links [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      htmlLines.push(`<div class="flex items-start mb-3"><span class="text-emerald-400 font-semibold text-lg mr-2 mt-0.5">${number}.</span><div class="text-white leading-relaxed flex-1">${text}</div></div>`)
    }
    // Green check mark business listings
    else if (line.startsWith('✅ ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      
      let text = line.substring(2).trim() // Remove ✅ and space
      // Handle bold text - enhanced processing
      text = text.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      // Handle markdown links [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      
      htmlLines.push(`<div class="flex items-start space-x-3 mb-6 mt-6">
        <span class="text-emerald-400 text-xl mt-1">✅</span>
        <div class="flex-1">
          <div class="text-white text-lg font-semibold mb-2">${text}</div>
        </div>
      </div>`)
    }
    // Bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      if (!inBulletList) {
        // Check if previous line was a check mark business for better indentation
        const wasCheckMarkBusiness = htmlLines.length > 0 && htmlLines[htmlLines.length - 1].includes('text-emerald-400')
        const indentClass = wasCheckMarkBusiness ? 'ml-8' : 'ml-6'
        htmlLines.push(`<ul class="space-y-2 mb-4 ${indentClass} list-disc list-outside">`)
        inBulletList = true
      }
      let text = line.substring(2)
      // Handle bold text - enhanced processing
      text = text.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      // Handle markdown links [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      
      // Check if we're in Next Steps section for emerald color
      const isInNextStepsSection = htmlLines.some(line => line.includes('Next Steps') || line.includes('next steps'))
      const colorClass = isInNextStepsSection ? 'text-emerald-400' : 'text-white'
      
      htmlLines.push(`<li class="${colorClass} leading-relaxed mb-2">${text}</li>`)
    }
    // Regular paragraphs
    else {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      // Don't close table here - let it continue across multiple lines
      let text = line
      // Handle bold text - enhanced processing
      text = text.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      // Handle markdown links [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      
      // Check if this is an ending question (contains ? and appears to be a question) OR follows a "Next Steps" header
      const lowerText = text.toLowerCase()
      const isQuestion = text.includes('?') && (lowerText.includes('what') || lowerText.includes('how') || lowerText.includes('which') || lowerText.includes('where') || lowerText.includes('when') || lowerText.includes('why') || lowerText.includes('would') || lowerText.includes('could') || lowerText.includes('should') || lowerText.includes('do you') || lowerText.includes('have you') || lowerText.includes('are you') || lowerText.includes('let me know') || lowerText.includes('need help') || lowerText.includes('looking for'))
      
      // Check if this could be a section header (ends with colon) that should close lists
      const isSectionHeader = text.endsWith(':') && text.length < 100
      if (isSectionHeader) {
        // Close any open lists before section headers
        if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
        if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
        if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      }
      
      // Check if we're in a "Next Steps" section by looking for previous "Next Steps" header
      const isInNextStepsSection = htmlLines.some(line => line.includes('Next Steps') || line.includes('next steps'))
      
      if (isQuestion || (isInNextStepsSection && i > htmlLines.findIndex(line => line.includes('Next Steps')))) {
        htmlLines.push(`<p class="text-emerald-400 font-medium leading-relaxed mb-3 mt-4">${text}</p>`)
      } else if (isSectionHeader) {
        htmlLines.push(`<p class="text-white font-semibold leading-relaxed mb-2 mt-4">${text}</p>`)
      } else {
        htmlLines.push(`<p class="text-white leading-relaxed mb-3">${text}</p>`)
      }
    }
  }
  
  // Close any remaining lists and tables
  if (inNumberedList) htmlLines.push('</div>')
  if (inBulletList) htmlLines.push('</ul>')
  if (inCheckList) htmlLines.push('</ul>')
  if (inTable) htmlLines.push('</tbody></table></div>')
  
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
// Component for the persistent welcome header
const WelcomeHeader = ({ user, isFirstTime }: { user: any, isFirstTime: boolean }) => {
  const [showBusinessContext, setShowBusinessContext] = useState(isFirstTime)
  
  if (!user) {
    return (
      <div className="px-3 py-3 sm:px-6 sm:py-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="space-y-2 sm:space-y-4">
          <h1 className="text-lg sm:text-2xl text-white font-semibold">
            Hi! 👋<br />
            I'm <span className="font-cursive text-emerald-400 font-bold text-xl sm:text-3xl">Dirt.i</span>, your AI Sidekick for growing your business.
          </h1>
          
          {/* What I can help with */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base text-gray-200">I can help you with:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-emerald-300">
              <div>• Marketing ideas & content creation</div>
              <div>• Upselling strategies</div>
              <div>• Smarter pricing & seasonal trends</div>
              <div>• Custom business planning</div>
              <div className="sm:col-span-2">• Scaling operations</div>
            </div>
          </div>
          
          {/* Quick examples */}
          <div className="space-y-1">
            <p className="text-sm text-gray-300">💡 Try asking something like:</p>
            <div className="text-xs sm:text-sm text-gray-400 space-y-1">
              <div>→ "How do I upsell spring cleanups?"</div>
              <div>→ "Generate a plan to get 10 new customers this month"</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { firstName, businessName, location, services, teamSize, zipCode } = user
  const displayName = firstName || 'there'
  
  // Create a single professional business summary line
  const businessSummary = (() => {
    let summary = ''
    if (businessName) summary += businessName
    if (location) {
      summary += summary ? ` in ${location}` : `Located in ${location}`
      if (zipCode) summary += ` ${zipCode}`
    }
    if (teamSize) summary += summary ? ` with a ${teamSize}-person team` : `${teamSize}-person team`
    if (services && services.length > 0) {
      const serviceList = services.length <= 4 ? services.join(', ') : `${services.slice(0, 4).join(', ')}, and more`
      summary += summary ? ` offering ${serviceList}` : `Offering ${serviceList}`
    }
    return summary
  })()
  
  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
      <div className="space-y-2 sm:space-y-4">
        {/* Simplified greeting */}
        <h1 className="text-lg sm:text-2xl text-white font-semibold">
          Hi {displayName}! 👋<br />
          I'm <span className="font-cursive text-emerald-400 font-bold text-xl sm:text-3xl">Dirt.i</span>, your AI Sidekick for growing <span className="text-emerald-200">{businessName || 'your business'}</span>.
        </h1>
        
        {/* What I can help with */}
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-gray-200">I can help you with:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-emerald-300">
            <div>• Marketing ideas & content creation</div>
            <div>• Upselling strategies</div>
            <div>• Smarter pricing & seasonal trends</div>
            <div>• Custom business planning</div>
            <div className="sm:col-span-2">• Scaling operations</div>
          </div>
        </div>
        
        {/* Quick examples */}
        <div className="space-y-1">
          <p className="text-sm text-gray-300">💡 Try asking something like:</p>
          <div className="text-xs sm:text-sm text-gray-400 space-y-1">
            <div>→ "How do I upsell spring cleanups?"</div>
            <div>→ "Generate a plan to get 10 new customers this month"</div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

// Simple greeting for chat messages (when welcome header is hidden)
const generateSimpleGreeting = (user: any): string => {
  if (!user) {
    return "Hi! I'm **Dirt.i**, your Landscaping AI Sidekick. I'm here to help you grow your landscaping business. What can I help you with today?"
  }
  
  const displayName = user.firstName || 'there'
  return `Hi, ${displayName}! I'm **Dirt.i**, your Landscaping AI Sidekick. How can we grow your business today?`
}

export default function LandscapingChat() {
  const router = useRouter()
  const [user, setUser] = useState<{
    email: string,
    firstName?: string,
    businessName: string,
    location: string,
    zipCode?: string,
    trade: string,
    services: string[],
    teamSize: number,
    targetCustomers: string,
    yearsInBusiness: number,
    mainChallenges: string[]
  } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [reactions, setReactions] = useState<Record<string, string>>({})
  const [conversationStartTime] = useState(new Date('2024-01-01'))
  const [messageCount, setMessageCount] = useState(1)
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const [hasRatedConversation, setHasRatedConversation] = useState(false)
  const [showHelpPanel, setShowHelpPanel] = useState(false)
  // Mobile detection hook for runtime behavior
  const isMobile = useIsMobile()
  const [isClient, setIsClient] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [currentModel, setCurrentModel] = useState<string>('')
  const [tokensUsedTrial, setTokensUsedTrial] = useState(0)
  const [trialTokenLimit, setTrialTokenLimit] = useState(250000) // 250k tokens total for 7-day trial
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [placeholderText, setPlaceholderText] = useState("")
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  
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
    if (typeof document !== 'undefined') {
      const scrollContainer = document.querySelector('.messages-scroll-container')
      if (scrollContainer) {
        // Use different scroll behavior for mobile vs desktop
        if (isMobile) {
          // Instant scroll on mobile for better performance
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        } else {
          // Smooth scroll on desktop for better UX
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        }
      } else {
        messagesEndRef.current?.scrollIntoView({
          behavior: isMobile ? "auto" : "smooth",
          block: "end",
          inline: "nearest",
        })
      }
    }
  }

  // Auto-resize textarea when input changes - smooth and responsive
  useEffect(() => {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
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
    }
  }, [input])

  useEffect(() => {
    // Set client state first to prevent hydration issues
    setIsClient(true)
    
    // Only run on client side after hydration
    if (typeof window !== 'undefined') {
      // Scroll to top when page loads
      window.scrollTo(0, 0)
    }
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
            firstName: data.user.firstName || '',
            businessName: data.user.businessName || 'Your Business',
            location: data.user.location || '',
            zipCode: data.user.zipCode || '',
            trade: data.user.trade || 'landscaping',
            services: data.user.services || [],
            teamSize: data.user.teamSize || 0,
            targetCustomers: data.user.targetCustomers || '',
            yearsInBusiness: data.user.yearsInBusiness || 0,
            mainChallenges: data.user.mainChallenges || []
          }
          setUser(userProfile)
          
          // Load user's actual token usage from database
          setTokensUsedTrial(data.user.tokensUsedTrial || 0)
          setTrialTokenLimit(data.user.trialTokenLimit || 250000)
          
          // Set up first-time user state
          setMessages([])
          setIsFirstTimeUser(true)
          setHasShownWelcome(false)
        } else if (response.status === 401) {
          // User not authenticated - use mock test data for development
          console.log('User not authenticated, loading mock test user for development')
          
          const mockUserProfile = {
            email: 'test@johnsonlandscaping.com',
            firstName: 'Mike',
            businessName: "Johnson's Landscaping",
            location: 'Dallas, TX',
            zipCode: '75201',
            trade: 'landscaping',
            services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation'],
            teamSize: 4,
            targetCustomers: 'residential homeowners',
            yearsInBusiness: 8,
            mainChallenges: ['finding new customers', 'pricing competition', 'seasonal cash flow']
          }
          setUser(mockUserProfile)
          
          // Set up first-time user state
          setMessages([])
          setIsFirstTimeUser(true)
          setHasShownWelcome(false)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // Load mock user on network errors too for testing
        const mockUserProfile = {
          email: 'test@johnsonlandscaping.com',
          firstName: 'Mike',
          businessName: "Johnson's Landscaping",
          location: 'Dallas, TX',
          zipCode: '75201',
          trade: 'landscaping',
          services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation'],
          teamSize: 4,
          targetCustomers: 'residential homeowners',
          yearsInBusiness: 8,
          mainChallenges: ['finding new customers', 'pricing competition', 'seasonal cash flow']
        }
        setUser(mockUserProfile)
        
        // Set up first-time user state
        setMessages([])
        setIsFirstTimeUser(true)
        setHasShownWelcome(false)
      }
    }
    fetchUser()
  }, [router])

  // Add welcome message for first-time users
  useEffect(() => {
    if (user && isFirstTimeUser && !hasShownWelcome && messages.length === 0) {
      const displayName = user.firstName || 'there'
      const businessName = user.businessName || 'your business'
      
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now().toString(),
        role: 'assistant',
        content: `<span class="text-white">Hi ${displayName}! I'm </span><span class="font-cursive text-emerald-400 font-semibold text-lg">Dirt.i</span><span class="text-white">, your business AI sidekick. How can I help you today?</span>`,
        timestamp: new Date()
      }
      
      setMessages([welcomeMessage])
      setHasShownWelcome(true)
      
      // Focus the input after a short delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 500)
    }
  }, [user, isFirstTimeUser, hasShownWelcome, messages.length, textareaRef])

  // Close user menu when clicking outside
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (showUserMenu && !target.closest('.relative')) {
          setShowUserMenu(false)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Scroll detection for scroll-to-bottom button
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const scrollContainer = document.querySelector('.messages-scroll-container')
      if (!scrollContainer) return
      
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollToBottom(!isNearBottom && messages.length > 1)
      }
      
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [messages.length])

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
    setMessages([])
    setCurrentConversationId(null)
    setShowSidebar(false)
    setIsFirstTimeUser(false) // Subsequent conversations don't show welcome message
    setHasShownWelcome(true) // Prevent welcome message from showing again
  }

  // Convert files to base64 for API transmission
  const convertFilesToBase64 = async (files: File[]): Promise<any[]> => {
    const filePromises = files.map(async (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result
          })
        }
        reader.readAsDataURL(file)
      })
    })
    
    return Promise.all(filePromises)
  }

  // Copy message content to clipboard
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      // Strip HTML tags and convert to plain text for copying
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      
      await navigator.clipboard.writeText(plainText)
      setCopiedMessageId(messageId)
      
      // Reset copy indicator after 2 seconds
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
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
    
    // Clear uploaded files after sending
    setUploadedFiles([])
    
    // Mark as no longer first time user when sending first message
    if (isFirstTimeUser) {
      setIsFirstTimeUser(false)
    }

    // Convert uploaded files to base64 for transmission
    let filesToSend: any[] = []
    if (uploadedFiles.length > 0) {
      try {
        filesToSend = await convertFilesToBase64(uploadedFiles)
        console.log('📁 Converted files for transmission:', filesToSend.length)
      } catch (error) {
        console.error('Failed to process files:', error)
      }
    }

    // Determine which model will be used (matches backend logic)
    const modelToUse = webSearchEnabled ? 'gpt-4o' : 'gpt-4o-mini'
    setCurrentModel(modelToUse)

    // Check if web search might be triggered
    if (webSearchEnabled) {
      // Simple logic: Toggle ON = always search (matches backend)
      console.log('🔍 Frontend search check: Web search enabled - always searching')
      setIsSearching(true)
      console.log('🔍 Setting isSearching to true')
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
          webSearchEnabled: webSearchEnabled,
          files: filesToSend
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok || !response.body) {
        // Handle token limit and trial expiration errors
        if (response.status === 403) {
          const errorData = await response.json()
          
          if (errorData.errorType === 'TOKEN_LIMIT_EXCEEDED') {
            const errorMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: `🚨 **Trial Limit Reached**\n\nYou've used all ${(errorData.tokenLimit/1000)}k tokens in your free trial!\n\n**Ready to upgrade?** Get unlimited access to continue growing your landscaping business with AI.\n\n**What happens next:**\n- Choose a paid plan to continue chatting\n- Keep all your conversation history\n- Access advanced features\n\n**[Choose Your Plan →](/signup?upgrade=true)**`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
            return
          }
          
          if (errorData.errorType === 'TRIAL_EXPIRED') {
            const errorMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: "assistant", 
              content: `⏰ **7-Day Trial Expired**\n\nYour free trial has ended! Hope you found AI Sidekick helpful for your landscaping business.\n\n**Ready to continue?** Upgrade to keep using your AI business advisor.\n\n**What you'll get:**\n- Unlimited conversations\n- Advanced competitor analysis\n- Priority support\n- New features as they launch\n\n**[Choose Your Plan →](/signup?upgrade=true)**`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
            return
          }
        }
        
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
          id: finalMessageId || assistantId,
          modelUsed: modelToUse
        }
        return updated
      })

      // Token usage is now tracked in the backend and database
      // Refresh user token usage from database
      if (user) {
        try {
          const profileResponse = await fetch('/api/user/profile')
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            setTokensUsedTrial(profileData.user.tokensUsedTrial || 0)
          }
        } catch (error) {
          console.error('Failed to refresh token usage:', error)
        }
      }

      setMessageCount(prev => {
        const newCount = prev + 1
        // Show rating prompt after 6+ messages (3+ exchanges) and not already rated
        if (newCount >= 6 && !hasRatedConversation && !showRatingPrompt) {
          setTimeout(() => setShowRatingPrompt(true), 2000) // Delay to not interrupt reading
        }
        return newCount
      })

      // Reset search indicator and clear uploaded files
      setIsSearching(false)
      setUploadedFiles([]) // Clear files after successful submission

    } catch (error) {
      console.error('Chat API Error:', error)
      
      // Try to get more details from the response
      if (error instanceof Error && error.message.includes('500')) {
        console.error('500 Error Details - this might be rate limits or API issues')
      }
      
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
        /* Mobile keyboard handling and safe areas */
        @media (max-width: 640px) {
          .mobile-chat-container {
            height: 100dvh; /* Dynamic viewport height */
            height: 100vh;
          }
          .safe-bottom {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }
          /* Ensure messages don't scroll under sticky input */
          .messages-scroll-container {
            padding-bottom: 160px !important;
          }
          /* Mobile-specific scroll optimizations */
          .mobile-scroll-container {
            -webkit-overflow-scrolling: touch; /* Smooth momentum scrolling on iOS */
            overscroll-behavior: contain; /* Prevent scroll chaining */
          }
          /* Handle keyboard visibility on mobile - Simplified for compatibility */
          .sticky-input-area {
            position: -webkit-sticky;
            position: sticky;
          }
        }
        /* Desktop centered layout */
        @media (min-width: 641px) {
          .desktop-chat-container {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            padding-left: 16px;
            padding-right: 16px;
          }
        }
        /* High-resolution desktop */
        @media (min-width: 1200px) {
          .desktop-chat-container {
            width: 100%;
            max-width: 900px;
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>
      <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">

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
                <h1 className="text-base sm:text-lg lg:text-xl typography-heading-bold text-white font-cursive">Dirt.i</h1>
                <p className="text-xs sm:text-sm text-gray-300 typography-body">Your Landscaping AI Sidekick</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm typography-heading-bold text-white font-cursive">Dirt.i</h1>
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

              {/* Token Usage Meter - Desktop Only */}
              {user && (
                <div className="hidden md:flex items-center space-x-2 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                        style={{ width: `${Math.min((tokensUsedTrial / trialTokenLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-blue-300 text-xs font-medium min-w-fit">
                      {(tokensUsedTrial / 1000).toFixed(0)}k / {(trialTokenLimit / 1000)}k
                    </span>
                  </div>
                </div>
              )}
              
              <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Online</span>
              </div>

              {/* Enhanced User Profile Dropdown - All Screen Sizes */}
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
                    <div className="absolute right-0 top-full mt-2 w-64 sm:w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-lg shadow-2xl z-50">
                      {/* User Info Header */}
                      <div className="p-4 border-b border-gray-600/30">
                        <p className="text-sm text-white typography-heading truncate">{user?.businessName || 'Test User Business'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email || 'test@example.com'}</p>
                        
                        {/* Mobile Token Usage */}
                        <div className="md:hidden mt-3 pt-3 border-t border-gray-600/30">
                          <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
                            <span>Trial Usage</span>
                            <span>{(tokensUsedTrial / 1000).toFixed(0)}k / {(trialTokenLimit / 1000)}k</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                              style={{ width: `${Math.min((tokensUsedTrial / trialTokenLimit) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Chat Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowHelpPanel(true)
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Tips & Help</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            window.location.href = '/'
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Home</span>
                        </button>
                        
                        <div className="border-t border-gray-600/30 my-2"></div>
                        
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

              {/* Sign In Button - Mobile (when not logged in) */}
              {!user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-3 py-2 text-sm"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
              )}
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
          <div className={`absolute left-0 top-0 h-full w-full sm:w-80 bg-gradient-to-br from-gray-900 via-gray-950 to-black border-r border-white/10 shadow-2xl overflow-y-auto ${isMobile ? 'touch-manipulation' : ''}`}>
            {/* Sidebar Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg typography-heading-bold text-white">Chat History</h2>
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

      {/* Main Chat Area - ChatGPT-like Layout */}
      <div className="flex-1 flex flex-col relative z-40">
        {/* Desktop Centered Container */}
        <div className="desktop-chat-container flex-1 flex flex-col min-h-0">
          {/* Chat Messages Container - Responsive Design */}
          <div className="flex-1 min-h-0">
            <div className="h-full flex flex-col">
              
              {/* Messages Area - Internal Scroll with Mobile Optimization */}
              <div 
                className={`messages-scroll-container overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-emerald-500/20 ${isMobile ? 'mobile-scroll-container' : ''}`}
                style={{
                  // Use instant scroll on mobile for better performance, smooth on desktop
                  scrollBehavior: isMobile ? 'auto' : 'smooth',
                  // Set fixed height to enable proper scrolling - ChatGPT approach
                  height: 'calc(100vh - 160px)',
                  // Add sufficient bottom padding so content is visible above input
                  paddingBottom: '140px'
                }}
              >
                <div className="w-full max-w-[900px] mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`group mb-4 ${
                      message.role === "user" ? "flex justify-end" : "flex justify-start"
                    }`}
                  >
                    {/* Message Content */}
                    <div className="max-w-[900px]">
                      <div
                        className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-[#1a1a1a] text-gray-100"
                        }`}
                        style={{
                          textAlign: "left"
                        }}
                      >
                        {message.role === "assistant" ? (
                          <div 
                            className="text-gray-50 typography-chat leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: convertMarkdownToHtml(message.content) 
                            }}
                          />
                        ) : (
                          <p className="text-white typography-chat whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Emoji Reactions and Copy Button - Only for assistant messages */}
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
                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              title="Copy message"
                              className="p-1 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-400">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Copy button and timestamp for user messages */}
                      {message.role === "user" && (
                        <div className="flex items-center justify-end space-x-2 mt-2">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              title="Copy message"
                              className="p-1 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Web Search Indicator */}
                {isSearching && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-lg px-4 py-3 max-w-[900px]">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                        </div>
                        <span className="text-sm text-blue-300 font-medium">🌐 Searching the web...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading Indicator - hide when AI starts generating text */}
                {isLoading && !isSearching && !messages[messages.length - 1]?.content && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-3 max-w-[900px]">
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

              {/* Scroll to Bottom Button - ChatGPT Style */}
              {showScrollToBottom && (
                <div className="absolute bottom-24 right-4 sm:right-6 z-40">
                  <button
                    onClick={() => {
                      scrollToBottom()
                      setShowScrollToBottom(false)
                    }}
                    className="bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-600/50 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
                    title="Scroll to bottom"
                  >
                    <ArrowUpIcon className="w-4 h-4 text-gray-300 rotate-180" />
                  </button>
                </div>
              )}

              {/* ChatGPT-style Input Bar - Always Visible */}
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-xl border-t border-gray-700/30 px-4 py-4 flex-shrink-0 z-50 safe-bottom">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="relative bg-[#1f1f1f] rounded-xl border border-transparent hover:border-emerald-500/20 focus-within:border-emerald-500/30 transition-all duration-300" style={{ padding: '12px 16px', borderRadius: '12px', boxShadow: 'none' }}>
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
                        className="w-full px-0 py-0 resize-none bg-transparent border-none text-white text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 placeholder:text-sm min-h-[48px] leading-relaxed"
                        style={{
                          overflow: "hidden",
                          // Use 16px on mobile to prevent zoom on iOS
                          fontSize: isClient && isMobile ? '16px' : undefined
                        }}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
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
                          className="group p-2 rounded-lg transition-colors flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 cursor-not-allowed relative"
                          disabled={true}
                          title="Website analysis coming soon! This will scan your website for SEO opportunities, content gaps, and local optimization improvements."
                        >
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="text-xs">
                            Analyze Website
                          </span>
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                            Soon
                          </div>
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
                            <ArrowUpIcon className="w-4 h-4" />
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
            </div>
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
                    { q: "What's 'Analyze Website' about?", a: "🚀 COMING SOON: I'll scan your website for SEO gaps, content opportunities, local optimization issues, and conversion improvements. Perfect for finding quick wins to outrank competitors!" },
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
