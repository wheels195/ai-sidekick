"use client"

// Reverted to clean version without sidebar components
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
  Settings,
  ChevronDown,
  ArrowUpIcon,
  Paperclip,
  Menu,
  History,
  Plus,
  Copy,
  Check,
  Wrench,
  Search,
  Users,
  Target,
  Camera,
  DollarSign,
  Mic,
  MicOff,
  Square,
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
  images?: Array<{
    url: string
    name: string
    type: 'uploaded' | 'generated'
  }>
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

const BUSINESS_CATEGORIES = [
  {
    id: 'search-rankings',
    name: 'Search Rankings',
    icon: TrendingUp,
    questions: [
      "What local SEO strategies will help me rank #1 in my area?",
      "How do I get 50+ Google reviews from happy customers?",
      "What's the best way to showcase before/after transformations?",
      "Analyze my competitor's website – what are they doing better?",
      "How do I build a reputation as the local landscaping expert?"
    ]
  },
  {
    id: 'customer-growth',
    name: 'Customer Growth',
    icon: Users,
    questions: [
      "Generate a 30-day plan to get 10 new high-value customers",
      "Write a compelling Nextdoor post that generates landscape leads",
      "Create a door-to-door script for neighborhoods with dead lawns",
      "What's the best way to approach new construction builders?",
      "How do I turn one-time customers into recurring maintenance clients?"
    ]
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    icon: Target,
    questions: [
      "Create a unique selling proposition that sets me apart completely",
      "How can I beat the top landscaping companies in my area?",
      "What high-margin services should I add to double my profit?",
      "Should I expand into irrigation? Pros and cons for my market",
      "What services are my competitors NOT offering that I should?"
    ]
  },
  {
    id: 'images',
    name: 'Images',
    icon: Camera,
    questions: [
      "Here's a photo of a dead front yard — give me a makeover idea to attract premium buyers",
      "Suggest three before-and-after transformations for this backyard photo",
      "What landscaping upgrades would make this patio look high-end?",
      "Turn this basic lawn into a luxurious outdoor space — what should I add?",
      "Show me a design idea using pavers and lighting based on this image"
    ]
  },
  {
    id: 'financial-growth',
    name: 'Financial Growth',
    icon: DollarSign,
    questions: [
      "How do I upsell lawn care customers into full landscape design?",
      "Design a maintenance package that maximizes monthly recurring revenue",
      "How do I justify premium pricing to price-sensitive customers?",
      "Create a pricing strategy that eliminates lowball competitors",
      "What seasonal services can I offer to increase winter revenue?",
      "How do I scale from solo operator to managing 3+ crews?",
      "What's the best way to finance new equipment for growth?",
      "What should I do now if I want to sell my landscaping business in 12 months?",
      "Should I buy out a smaller landscaping company in my area?",
      "What loan or financing options (like SBA) are available for growing my business?"
    ]
  }
]

// Enhanced markdown-to-HTML converter with checklist support and table support
const convertMarkdownToHtml = (markdown: string): string => {
  // CRITICAL FIX: First, ensure all double asterisks are properly handled
  // Replace any escaped asterisks or variations
  let processedMarkdown = markdown
    .replace(/\\\*/g, '*') // Replace escaped asterisks
    .replace(/\*\s+\*/g, '**') // Fix spaced asterisks
  
  const lines = processedMarkdown.split('\n')
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
        htmlLines.push('<table class="min-w-full backdrop-blur-xl bg-gradient-to-br from-gray-800/60 via-gray-900/40 to-black/20 border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10">')
        htmlLines.push('<thead class="bg-gradient-to-r from-emerald-600/20 via-emerald-700/30 to-emerald-800/20 backdrop-blur-sm">')
        htmlLines.push('<tr>')
        
        cells.forEach(header => {
          htmlLines.push(`<th class="px-3 sm:px-4 py-4 text-left text-emerald-300 font-bold text-sm sm:text-base border-b border-emerald-500/30 backdrop-blur-sm">${header}</th>`)
        })
        
        htmlLines.push('</tr>')
        htmlLines.push('</thead>')
        htmlLines.push('<tbody class="backdrop-blur-sm">')
        inTable = true
      } else {
        // Skip separator line (contains dashes)
        if (cells.every(cell => cell.match(/^[-:]+$/))) {
          continue
        }
        
        // Add table row
        htmlLines.push('<tr class="border-b border-emerald-500/10 hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-transparent transition-all duration-300 backdrop-blur-sm">')
        
        cells.forEach((cell, index) => {
          // Handle bold text in cells - enhanced processing
          let processedCell = cell.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="font-semibold text-emerald-200">$1</strong>')
          // Handle links in cells
          processedCell = processedCell.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors duration-200">$1</a>')
          
          htmlLines.push(`<td class="px-3 sm:px-4 py-3 text-gray-100 text-sm sm:text-base">${processedCell}</td>`)
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
      // Remove ** from header text since headers are already bold
      const headerText = line.substring(5).replace(/\*\*/g, '')
      htmlLines.push(`<h4 class="text-base font-semibold text-emerald-300 mt-4 mb-2">${headerText}</h4>`)
    }
    else if (line.startsWith('### ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      // Remove ** from header text since headers are already bold
      const headerText = line.substring(4).replace(/\*\*/g, '')
      htmlLines.push(`<h3 class="text-lg font-semibold text-emerald-400 mt-5 mb-2">${headerText}</h3>`)
    }
    else if (line.startsWith('## ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      // Remove ** from header text since headers are already bold
      const headerText = line.substring(3).replace(/\*\*/g, '')
      htmlLines.push(`<h2 class="text-xl font-bold text-emerald-300 mt-6 mb-3">${headerText}</h2>`)
    }
    else if (line.startsWith('# ')) {
      if (inNumberedList) { htmlLines.push('</div>'); inNumberedList = false; }
      if (inBulletList) { htmlLines.push('</ul>'); inBulletList = false; }
      if (inCheckList) { htmlLines.push('</ul>'); inCheckList = false; }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaders = []; }
      // Remove ** from header text since headers are already bold
      const headerText = line.substring(2).replace(/\*\*/g, '')
      htmlLines.push(`<h1 class="text-2xl font-bold text-emerald-200 mt-6 mb-4">${headerText}</h1>`)
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
      htmlLines.push(`<div class="flex items-start mb-3"><span class="text-emerald-400 font-semibold text-base mr-2 mt-0.5">${number}.</span><div class="text-white leading-relaxed flex-1 text-base">${text}</div></div>`)
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
            I'm <span className="font-cursive text-emerald-400 font-bold text-2xl sm:text-3xl">Scout</span>, your AI Sidekick for growing your business.
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
          I'm <span className="font-cursive text-emerald-400 font-bold text-2xl sm:text-3xl">Scout</span>, your AI Sidekick for growing <span className="text-emerald-200">{businessName || 'your business'}</span>.
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
    return "Hi! I'm **Scout**, your Landscaping AI Sidekick. I'm here to help you grow your landscaping business. What can I help you with today?"
  }
  
  const displayName = user.firstName || 'there'
  return `Hi, ${displayName}! I'm **Scout**, your Landscaping AI Sidekick. How can we grow your business today?`
}

// Generate better responses for image creation
const generateImageSuccessResponse = (prompt: string): string => {
  const responses = [
    `✨ I've created a custom landscaping image for you based on: "${prompt}"

**What you can do with this image:**
- Share it on social media to showcase your vision
- Use it in proposals or presentations
- Add it to your portfolio
- Show clients different design possibilities

Need any adjustments or want to create another variation? Just let me know!`,
    
    `🎨 Here's your landscaping visualization for: "${prompt}"

**Pro tip:** This image can help you:
- Communicate design ideas with clients
- Create before/after comparisons
- Build your online portfolio
- Generate social media content

Want to explore different angles or styles? I'm here to help!`,
    
    `📸 Your custom image is ready: "${prompt}"

**Business uses:**
- Client presentations and proposals
- Marketing materials and flyers
- Website galleries
- Social media posts

I can create variations or entirely new concepts - just describe what you need!`
  ]
  
  // Randomly select a response for variety
  return responses[Math.floor(Math.random() * responses.length)]
}

// Rotating welcome messages system
const WELCOME_MESSAGES = [
  "How can I help grow your landscaping business today?",
  "What's on your business agenda today?",
  "Ready to tackle today's landscaping challenges?",
  "Let's make your business bloom today",
  "What can Scout help you accomplish today?",
  "How can we elevate your landscaping business?",
  "What's your biggest business priority right now?",
  "Let's turn your landscaping goals into reality",
  "Ready to outgrow your competition?",
  "What business wins are we chasing today?"
]

const getDailyWelcomeMessage = (): string => {
  // Calculate days since epoch at 9am EST
  const now = new Date()
  const est = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  
  // Get date at 9am EST
  const rotationDate = new Date(est)
  if (est.getHours() < 9) {
    // If before 9am, use previous day's message
    rotationDate.setDate(rotationDate.getDate() - 1)
  }
  rotationDate.setHours(9, 0, 0, 0)
  
  // Calculate days since epoch
  const epochStart = new Date('1970-01-01')
  const daysSinceEpoch = Math.floor((rotationDate.getTime() - epochStart.getTime()) / (24 * 60 * 60 * 1000))
  
  // Use modulo to cycle through messages
  return WELCOME_MESSAGES[daysSinceEpoch % WELCOME_MESSAGES.length]
}

interface LandscapingChatClientProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    businessName: string
    trade: string
    location: string
    zipCode: string
    services: string[]
    teamSize: number
    targetCustomers: string
    yearsInBusiness: number
    businessPriorities: string[]
    tokensUsedTrial: number
    trialTokenLimit: number
    hasConversationHistory: boolean
  }
  initialGreeting: string
  isReturningUser: boolean
}

export default function LandscapingChatClient({ user: initialUser, initialGreeting, isReturningUser }: LandscapingChatClientProps) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(!isReturningUser)
  const [hasShownWelcome, setHasShownWelcome] = useState(true)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [reactions, setReactions] = useState<Record<string, string>>({})
  const [conversationStartTime] = useState(new Date('2025-01-01'))
  const [messageCount, setMessageCount] = useState(1)
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const [hasRatedConversation, setHasRatedConversation] = useState(false)
  const [showHelpPanel, setShowHelpPanel] = useState(false)
  // Mobile detection hook for runtime behavior
  const isMobile = useIsMobile()
  const [isClient, setIsClient] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => crypto.randomUUID())
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [activeTool, setActiveTool] = useState<string | null>(null) // 'web-search', 'create-image', 'attach-file', null
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string
    url: string
    prompt: string
    createdAt: string
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  // Category dropdown state
  const [showCategoryQuestions, setShowCategoryQuestions] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [currentModel, setCurrentModel] = useState<string>('')
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [buttonsAnimated, setButtonsAnimated] = useState(false)
  const [isLoadingComplete, setIsLoadingComplete] = useState(false)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true)
  const [welcomeMessageVisible, setWelcomeMessageVisible] = useState(false)
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<'auto' | 'en' | 'es'>('en')
  
  // Stable textarea ref without auto-resize to prevent layout shift
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Stable adjustHeight function that doesn't cause initial layout shift
  const adjustHeight = useCallback((reset = false) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    if (reset) {
      textarea.style.height = '48px' // min-height
      textarea.style.overflow = 'hidden'
    } else {
      const maxHeight = isMobile ? Math.min(window.innerHeight * 0.3, 120) : 150
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = newHeight + 'px'
      
      // Enable scroll if content exceeds max height
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflow = 'auto'
      } else {
        textarea.style.overflow = 'hidden'
      }
    }
  }, [isMobile])

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

  // Remove conflicting auto-resize logic to prevent layout shift
  // The adjustHeight() function in onChange handles this instead

  useEffect(() => {
    // Client is ready - no delays needed
    if (typeof window !== 'undefined') {
      // Scroll to top when page loads
      window.scrollTo(0, 0)
    }
    
    // Cleanup object URLs on unmount
    return () => {
      messages.forEach(msg => {
        if (msg.images) {
          msg.images.forEach(img => {
            if (img.type === 'uploaded' && img.url.startsWith('blob:')) {
              URL.revokeObjectURL(img.url)
            }
          })
        }
      })
    }
  }, [])

  // Handle viewport changes and keyboard visibility
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    const handleResize = () => {
      // Force recalculation of container heights
      const messagesContainer = document.querySelector('.messages-scroll-container')
      if (messagesContainer && isMobile) {
        // Use visualViewport if available for better mobile keyboard handling
        const viewportHeight = window.visualViewport?.height || window.innerHeight
        const headerHeight = 80 // Approximate header height
        const inputHeight = 160 // Approximate input area height
        const newHeight = Math.max(300, viewportHeight - headerHeight - inputHeight)
        
        messagesContainer.style.height = `${newHeight}px`
        messagesContainer.style.maxHeight = `${newHeight}px`
      }
    }

    const handleOrientationChange = () => {
      // Delay to allow viewport to stabilize
      setTimeout(handleResize, 300)
    }

    // Handle visual viewport changes (mobile keyboard)
    const handleVisualViewportChange = () => {
      if (window.visualViewport && isMobile) {
        handleResize()
      }
    }

    // Add event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
    }

    // Multiple calculations to handle viewport stabilization
    requestAnimationFrame(() => {
      handleResize()
      requestAnimationFrame(() => {
        handleResize()
        requestAnimationFrame(() => handleResize())
      })
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
      }
    }
  }, [isClient, isMobile])

  useEffect(() => {
    // Only scroll to bottom when a new message is added, not on initial load or typing
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages.length]) // Changed dependency to messages.length instead of messages

  // Set initial token usage from server data
  const [tokensUsedTrial, setTokensUsedTrial] = useState(initialUser.tokensUsedTrial)
  const [trialTokenLimit, setTrialTokenLimit] = useState(initialUser.trialTokenLimit)

  // Load conversation history for signed-in users
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (user) { // Simplified: load for any signed-in user
        try {
          const response = await fetch('/api/conversations?limit=20')
          if (response.ok) {
            const data = await response.json()
            
            // Load saved conversations for sidebar
            if (data.sessions && data.sessions.length > 0) {
              const conversations: SavedConversation[] = data.sessions.map((session: any) => ({
                id: session.sessionId,
                title: session.title,
                messages: session.messages.map((msg: any) => ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp),
                  modelUsed: msg.modelUsed
                })),
                createdAt: new Date(session.createdAt),
                updatedAt: new Date(session.updatedAt)
              }))
              
              setSavedConversations(conversations)
              
              // Update welcome message for returning users with conversations
              if (conversations.length > 0 && messages[0]?.role === 'assistant') {
                const updatedGreeting = `<span class="text-white">Hey ${user.firstName || 'there'}! What are we working on today?</span>`
                setMessages(prevMessages => [
                  { ...prevMessages[0], content: updatedGreeting },
                  ...prevMessages.slice(1)
                ])
              }
              
              // Don't auto-load the last conversation - start fresh each time
              // Users can still access their history via the sidebar if needed
            }
          }
        } catch (error) {
          console.log('Could not load conversation history:', error)
          // Silently continue - no need to show error to user
        }
      }
    }
    
    loadConversationHistory()
  }, [user]) // Simplified dependency

  // Set hasMounted to prevent hydration mismatches
  useEffect(() => {
    setHasMounted(true)
    // Small delay to show loading skeleton, then complete loading
    setTimeout(() => {
      setIsLoadingComplete(true)
      // Trigger button animation after loading completes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setButtonsAnimated(true))
      })
      // Show welcome message with fade-in after loading completes
      setTimeout(() => {
        setWelcomeMessageVisible(true)
      }, 200)
    }, 800) // 800ms to show loading state
  }, [])

  // Focus input when component loads (no delay needed)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Close user menu, tools dropdown, and category dropdown when clicking outside
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        
        // Close user menu
        if (showUserMenu && !target.closest('.relative')) {
          setShowUserMenu(false)
        }
        
        // Close tools dropdown
        if (showToolsDropdown && !target.closest('.tools-dropdown-container')) {
          setShowToolsDropdown(false)
        }
        
        // Close category dropdown
        if (showCategoryQuestions && !target.closest('.category-container')) {
          setShowCategoryQuestions(false)
          setActiveCategory(null)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [showUserMenu, showToolsDropdown, showCategoryQuestions])

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
      router.push('/login?logout=true')
    } catch (error) {
      console.error('Logout failed:', error)
      // Force redirect even if API fails
      router.push('/login?logout=true')
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

  // Handle tool selection
  const handleToolSelect = (tool: string) => {
    if (tool === activeTool) {
      // If same tool clicked, deactivate it
      setActiveTool(null)
    } else {
      // Activate new tool
      setActiveTool(tool)
    }
    setShowToolsDropdown(false)
  }

  // Generate image inline in chat (when create-image tool is active)
  const handleInlineImageGeneration = async (prompt: string) => {
    if (isGeneratingImage) return null

    setIsGeneratingImage(true)
    
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard',
          style: 'natural',
          businessContext: true
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Image generation failed:', data)
        return `I couldn't generate that image: ${data.error || 'Generation failed'}`
      }

      // Add to generated images history
      const newImage = {
        id: data.image.id || Date.now().toString(),
        url: data.image.url,
        prompt: data.image.originalPrompt,
        createdAt: new Date().toISOString()
      }
      
      setGeneratedImages(prev => [newImage, ...prev])
      
      return `I generated an image for you: "${data.image.originalPrompt}"\n\n![Generated Image](${data.image.url})`
      
    } catch (error) {
      console.error('Image generation error:', error)
      return 'Sorry, I encountered an error generating that image. Please try again.'
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Detect if user is requesting image generation
  const detectImageGenerationIntent = (message: string): boolean => {
    if (activeTool !== 'create-image') return false
    
    const imageKeywords = [
      'generate', 'create', 'make', 'design', 'draw', 'show me',
      'logo', 'flyer', 'banner', 'image', 'picture', 'photo',
      'before and after', 'transformation', 'marketing material'
    ]
    
    const lowerMessage = message.toLowerCase()
    return imageKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Category handlers
  const handleCategorySelect = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setShowCategoryQuestions(false)
      setActiveCategory(null)
    } else {
      setActiveCategory(categoryId)
      setShowCategoryQuestions(true)
    }
  }

  const handleQuestionSelect = (question: string) => {
    setInput(question)
    setShowCategoryQuestions(false)
    setActiveCategory(null)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Process uploaded files to extract image previews
    const imageAttachments: Array<{ url: string; name: string; type: 'uploaded' | 'generated' }> = []
    
    // Create object URLs for image previews
    for (const file of uploadedFiles) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        imageAttachments.push({
          url,
          name: file.name,
          type: 'uploaded'
        })
      }
    }

    // ① Add user message immediately with image attachments
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      images: imageAttachments.length > 0 ? imageAttachments : undefined
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setMessageCount(prev => prev + 1)
    
    // Mark as no longer first time user when sending first message
    if (isFirstTimeUser) {
      setIsFirstTimeUser(false)
    }
    
    // Hide welcome message when user sends first message  
    if (showWelcomeMessage && messages.length === 0) {
      setShowWelcomeMessage(false)
    }

    // Check for image generation intent first
    if (detectImageGenerationIntent(input.trim())) {
      console.log('🎨 Image generation detected, generating inline...')
      setIsGeneratingImage(true)
      const assistantId = (Date.now() + 1).toString()
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ])
      
      const imageResult = await handleInlineImageGeneration(input.trim())
      
      if (imageResult) {
        const data = await fetch('/api/images/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: input.trim(),
            model: 'dall-e-3',
            size: '1024x1024',
            quality: 'standard',
            style: 'natural',
            businessContext: true
          }),
        }).then(res => res.json())
        
        // Add AI response with generated image using the new image system
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId 
            ? {
                ...msg,
                content: generateImageSuccessResponse(data.image?.originalPrompt || input.trim()),
                images: [{
                  url: data.image?.url || '',
                  name: `Generated: ${data.image?.originalPrompt || input.trim()}`,
                  type: 'generated' as const
                }],
                modelUsed: 'dall-e-3'
              }
            : msg
        ))
      }
      
      setIsLoading(false)
      setIsGeneratingImage(false)
      return
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
    
    // Clear uploaded files after processing
    setUploadedFiles([])

    // Determine which model will be used (matches backend logic)
    const webSearchEnabled = activeTool === 'web-search'
    const modelToUse = webSearchEnabled ? 'gpt-4o' : 'gpt-4o-mini'
    setCurrentModel(modelToUse)

    // Check if web search might be triggered
    if (webSearchEnabled) {
      // Simple logic: Toggle ON = always search (matches backend)
      console.log('🔍 Frontend search check: Web search enabled - always searching')
      setIsSearching(true)
      console.log('🔍 Setting isSearching to true')
    }

    // ② Create assistant message placeholder for streaming (only for non-image requests)
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ])

    try {
      // Call our streaming API endpoint with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout
      
      console.log('📤 Sending chat request with session ID:', {
        currentSessionId: currentSessionId,
        messageCount: [...messages, userMessage].length
      })
      
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
          sessionId: currentSessionId,
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

      // ⑥ Update currentSessionId to maintain conversation continuity
      if (sessionId && sessionId !== currentSessionId) {
        console.log('🔗 Updating session ID for conversation continuity:', {
          oldSessionId: currentSessionId,
          newSessionId: sessionId
        })
        setCurrentSessionId(sessionId)
      }

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

  // Helper function to set recording error with auto-deletion after 3 seconds
  const setRecordingErrorWithTimeout = (errorMessage: string) => {
    console.log('Setting recording error:', errorMessage)
    setRecordingError(errorMessage)
    
    // Auto-delete error after 3 seconds
    setTimeout(() => {
      setRecordingError(null)
    }, 3000)
  }

  // Check microphone permission status
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        console.log('Microphone permission status:', permission.state)
        return permission.state === 'granted'
      }
    } catch (error) {
      console.log('Permission API not supported, will request directly')
    }
    return false
  }

  // Speech-to-text functions
  const startRecording = async () => {
    try {
      setRecordingError(null)
      
      // Check if we're on HTTPS (required for mobile)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setRecordingErrorWithTimeout('Voice recording requires a secure connection (HTTPS).')
        return
      }
      
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingErrorWithTimeout('Voice recording is not supported in this browser.')
        return
      }
      
      console.log('Requesting microphone access...')

      // Check permission first (especially important for mobile)
      const hasPermission = await checkMicrophonePermission()
      console.log('Pre-check permission result:', hasPermission)
      
      // Use very basic constraints - especially important for mobile
      const constraints = {
        audio: true // Most basic request to avoid mobile issues
      }
      
      console.log('Requesting getUserMedia with constraints:', constraints)
      
      // On mobile, add a small delay to ensure user gesture is properly registered
      if (isMobile) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Request microphone permission with explicit user gesture
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('Microphone access granted, creating MediaRecorder...')
      
      // Check supported MIME types
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ]
      
      let mimeType = 'audio/webm'
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }
      
      console.log('Using MIME type:', mimeType)
      
      // Create MediaRecorder instance
      const recorder = new MediaRecorder(stream, { mimeType })
      
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes')
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        console.log('Recording stopped, creating audio blob...')
        const audioBlob = new Blob(chunks, { type: mimeType })
        console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type)
        
        // Only transcribe if we have audio data
        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob)
        } else {
          setRecordingErrorWithTimeout('No audio data recorded. Please try speaking louder.')
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        setMediaRecorder(null)
        setAudioChunks([])
      }
      
      recorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error)
        setRecordingErrorWithTimeout('Recording failed: ' + event.error.message)
      }
      
      // Start recording
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setAudioChunks(chunks)
      
      // Clear any previous errors since recording started successfully
      setRecordingError(null)
      
      console.log('Recording started successfully')
      
    } catch (error: any) {
      console.error('Error starting recording:', error)
      
      let errorMessage = 'Failed to access microphone. '
      
      if (error.name === 'NotAllowedError') {
        errorMessage = isMobile 
          ? 'Microphone permission denied. Please tap "Allow" when your browser prompts you, then try the microphone button again.'
          : 'Microphone permission denied. Please allow microphone access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please check that a microphone is connected.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is already in use by another application.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Microphone constraints not supported by your device.'
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Microphone access blocked by security policy. Try using HTTPS.'
      } else {
        errorMessage += error.message || 'Unknown error occurred.'
      }
      
      setRecordingErrorWithTimeout(errorMessage)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true)
      setRecordingError(null) // Clear any previous errors when starting transcription
      
      console.log('Starting transcription...', {
        size: audioBlob.size,
        type: audioBlob.type
      })
      
      // Create FormData to send audio file
      const formData = new FormData()
      
      // Use appropriate filename based on blob type
      const extension = audioBlob.type.includes('webm') ? 'webm' : 
                       audioBlob.type.includes('mp4') ? 'mp4' :
                       audioBlob.type.includes('ogg') ? 'ogg' : 'webm'
      
      formData.append('audio', audioBlob, `recording.${extension}`)
      
      console.log('Sending audio to transcription API...', { language: transcriptionLanguage })
      
      // Build URL with language parameter
      const apiUrl = new URL('/api/audio/transcribe', window.location.origin)
      if (transcriptionLanguage !== 'auto') {
        apiUrl.searchParams.set('language', transcriptionLanguage)
      }
      
      // Send to our transcription API
      const response = await fetch(apiUrl.toString(), {
        method: 'POST',
        body: formData,
      })
      
      console.log('Transcription API response status:', response.status)
      
      // Handle response more carefully - it might not be JSON
      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError)
          const textResponse = await response.text()
          console.error('Raw response text:', textResponse)
          throw new Error(`Server returned invalid JSON: ${textResponse}`)
        }
      } else {
        const textResponse = await response.text()
        console.error('Non-JSON response:', textResponse)
        data = { error: textResponse || 'Empty response from server' }
      }
      
      console.log('Transcription API response:', data)
      
      if (!response.ok) {
        console.error('Transcription API error details:', {
          status: response.status,
          error: data.error,
          details: data.details,
          errorDetails: data.errorDetails,
          debugInfo: data.debugInfo
        })
        throw new Error(data.error || `Server error: ${response.status}`)
      }
      
      // Insert transcribed text into the input
      if (data.text && data.text.trim()) {
        console.log('Transcribed text:', data.text)
        setInput(prev => prev + (prev ? ' ' : '') + data.text.trim())
        
        // Clear any previous errors since transcription succeeded
        setRecordingError(null)
        
        // Focus the textarea after inserting text
        if (textareaRef.current) {
          textareaRef.current.focus()
          // Adjust height to accommodate new text
          setTimeout(() => adjustHeight(), 100)
        }
      } else {
        setRecordingErrorWithTimeout('No speech detected. Please try speaking more clearly.')
      }
      
    } catch (error: any) {
      console.error('Transcription error:', error)
      
      let errorMessage = 'Failed to transcribe audio. '
      
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error. Please sign in again.'
      } else if (error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.message.includes('413')) {
        errorMessage = 'Audio file too large. Please record a shorter message.'
      } else {
        errorMessage += error.message || 'Please try again.'
      }
      
      setRecordingErrorWithTimeout(errorMessage)
    } finally {
      setIsTranscribing(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const suggestedQuestions = [
    "How can I rank higher for landscaping in my city?",
    "What should I blog about this season?",
    "What services can I upsell to lawn clients?",
    "How do I get more 5-star reviews?",
    "Help me write a service page for tree trimming",
  ]

  // Don't render anything until client-side hydration is complete
  if (!hasMounted || !isLoadingComplete) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
        {/* Loading Header Skeleton */}
        <header className="fixed top-0 left-0 right-0 flex-shrink-0 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl z-50">
          <div className="w-full px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="hidden sm:block w-16 h-8 bg-emerald-500/20 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full animate-pulse"></div>
                <div className="w-20 h-8 bg-blue-500/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading Chat Interface Skeleton */}
        <div className="flex-1 pt-16 sm:pt-20 relative">
          <div className="h-full flex flex-col">
            {/* Loading Messages Area */}
            <div className="flex-1 px-4 py-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-500/30 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Loading Input Area */}
            <div className="flex-shrink-0 px-4 pb-6">
              <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
                  <div className="w-12 h-12 bg-emerald-500/30 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Spinner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-emerald-300 rounded-full animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
              </div>
              <div className="text-emerald-400 text-lg font-medium animate-pulse">
                Loading Scout...
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        
        .font-cursive {
          font-family: var(--font-cursive), 'Brush Script MT', cursive;
        }
        
        /* Smooth loading transition */
        .loading-fade-out {
          opacity: 1;
          transition: opacity 0.5s ease-out;
        }
        
        .loading-fade-out.fade-out {
          opacity: 0;
        }
        /* Mobile keyboard handling and safe areas */
        @media (max-width: 640px) {
          .mobile-chat-container {
            height: 100dvh; /* Dynamic viewport height only */
          }
          .safe-bottom {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }
          /* Ensure messages don't scroll under sticky input */
          .messages-scroll-container {
            padding-bottom: max(320px, env(safe-area-inset-bottom)) !important; /* Further increased to prevent overlap */
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
            bottom: 0;
            z-index: 50;
          }
          /* Ensure input is always visible */
          .mobile-input-container {
            min-height: 100px; /* Reduced from 120px */
            padding-bottom: max(20px, env(safe-area-inset-bottom)); /* Reduced from 32px */
          }
          /* Dynamic viewport height containers */
          .mobile-messages-container {
            /* Use flex-1 instead of fixed height to prevent unnecessary scrolling */
          }
          /* Hide category buttons on mobile to prevent layout issues */
          .category-container {
            display: none !important;
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
      <div className="flex flex-col mobile-chat-container bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden h-screen">

      {/* Fixed Header - Always Visible */}
      <header className="fixed top-0 left-0 right-0 flex-shrink-0 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl z-50">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2"
              >
                <span>Home</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden sm:inline-flex text-xs sm:text-sm bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 hover:text-emerald-200 rounded-full transition-all duration-300 px-3 sm:px-4 py-1 sm:py-2 items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chats</span>
              </Button>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg lg:text-xl typography-heading-bold text-white font-bold">Scout | Your AI Sidekick</h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base typography-heading-bold text-white font-bold">Scout | Your AI Sidekick</h1>
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
                        
                      </div>
                      
                      {/* Chat Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowHelpPanel(true)
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-green-300 hover:text-green-200 hover:bg-green-500/10 rounded-md transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Tips & Help</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowSidebar(true)
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-md transition-colors duration-200 flex items-center space-x-2 sm:hidden"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Chats</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/account/settings')
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-md transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Account Settings</span>
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
          <div className="flex-1 min-h-0 pt-14 sm:pt-16 lg:pt-20">
            <div className="h-full flex flex-col">
              
              {/* ChatGPT-style Welcome Message - Centered */}
              {showWelcomeMessage && messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div 
                    className={`text-center px-4 py-8 transition-all duration-800 ease-out ${
                      welcomeMessageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{
                      animation: welcomeMessageVisible ? 'fadeInUp 800ms ease-out' : undefined
                    }}
                  >
                  <style jsx>{`
                    @keyframes fadeInUp {
                      from {
                        opacity: 0;
                        transform: translateY(10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                    <h2 className="text-2xl sm:text-3xl font-normal text-white leading-relaxed max-w-2xl mx-auto">
                      {getDailyWelcomeMessage()}
                    </h2>
                  </div>
                </div>
              )}

              {/* Messages Area - Internal Scroll with Mobile Optimization */}
              <div 
                className={`messages-scroll-container overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-emerald-500/20 ${isMobile ? 'mobile-scroll-container mobile-messages-container' : ''}`}
                style={isMobile ? {
                  scrollBehavior: 'auto',
                  height: 'calc(100dvh - 200px)',
                  maxHeight: 'calc(100dvh - 200px)',
                  paddingBottom: `max(320px, env(safe-area-inset-bottom))`,
                  overscrollBehavior: 'contain'
                } : {
                  scrollBehavior: 'smooth',
                  height: 'calc(100vh - 240px)',
                  paddingBottom: '320px',
                  overscrollBehavior: 'contain'
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
                        className={`px-4 py-2 rounded-2xl transition-all duration-200 ${
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
                            className="text-gray-50 typography-chat leading-relaxed text-base"
                            dangerouslySetInnerHTML={{ 
                              __html: convertMarkdownToHtml(message.content) 
                            }}
                          />
                        ) : (
                          <p className="text-white typography-chat whitespace-pre-wrap leading-relaxed text-base">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Image Attachments Display */}
                      {message.images && message.images.length > 0 && (
                        <div className={`mt-3 ${message.role === "user" ? "flex justify-end" : ""}`}>
                          <div className={`grid ${message.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 max-w-md`}>
                            {message.images.map((img, index) => (
                              <div 
                                key={index} 
                                className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-700 hover:border-emerald-500/50 transition-all duration-200"
                                onClick={() => setFullscreenImage({ url: img.url, name: img.name })}
                              >
                                <img 
                                  src={img.url} 
                                  alt={img.name}
                                  className="w-full h-auto max-h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <div className="text-white text-center p-2">
                                    <p className="text-xs font-medium truncate max-w-[150px]">{img.name}</p>
                                    <p className="text-xs mt-1">Click to expand</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
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
                        {isGeneratingImage ? (
                          <>
                            <div className="relative w-5 h-5">
                              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                              <div className="relative w-5 h-5 rounded-full bg-emerald-400/40 flex items-center justify-center">
                                <svg className="w-3 h-3 text-emerald-400 animate-spin" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-emerald-300 font-medium">✨ Creating your image...</span>
                              <span className="text-xs text-gray-400">This may take 10-15 seconds</span>
                            </div>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
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

              {/* Scroll to Bottom Button - Centered Above Chat Input */}
              {showScrollToBottom && (
                <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 z-[70]">
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
              <div 
                className="sticky bottom-0 left-0 right-0 px-4 py-4 flex-shrink-0 z-10 safe-bottom sticky-input-area mobile-input-container bg-gray-950 rounded-t-2xl"
                style={{
                  paddingBottom: isMobile ? `max(32px, env(safe-area-inset-bottom))` : '16px',
                  minHeight: '120px' // Consistent height to prevent layout shifts
                }}
              >
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="relative rounded-2xl border-2 border-emerald-500/40 p-3">
                    <div className="overflow-hidden">
                      {/* File Upload Display with Image Previews - Reserve space to prevent layout shift */}
                      <div className="min-h-0" style={{ height: uploadedFiles.length > 0 ? 'auto' : '0px', overflow: uploadedFiles.length > 0 ? 'visible' : 'hidden' }}>
                        {uploadedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2">
                            {uploadedFiles.map((file, index) => {
                              const isImage = file.type.startsWith('image/')
                              const previewUrl = isImage ? URL.createObjectURL(file) : null
                              
                              return (
                                <div key={index} className="relative">
                                  {isImage && previewUrl ? (
                                    <div className="relative group">
                                      <img 
                                        src={previewUrl}
                                        alt={file.name}
                                        className="h-16 w-16 object-cover rounded-lg border border-emerald-500/30"
                                        loading="eager"
                                        onLoad={() => {
                                          // Ensure container recalculates after image loads
                                          if (textareaRef.current) {
                                            const event = new Event('input', { bubbles: true })
                                            textareaRef.current.dispatchEvent(event)
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() => {
                                          setUploadedFiles(prev => prev.filter((_, i) => i !== index))
                                          URL.revokeObjectURL(previewUrl)
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 rounded-b-lg truncate">
                                        {file.name}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1 text-xs">
                                      <FileText className="w-3 h-3 text-emerald-300" />
                                      <span className="text-emerald-300">{file.name}</span>
                                      <button
                                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                                        className="text-emerald-400 hover:text-emerald-300"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value)
                          if (hasMounted) adjustHeight()
                        }}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onTouchStart={(e) => {
                          // Ensure proper touch handling on mobile
                          if (isMobile && textareaRef.current) {
                            e.preventDefault()
                            textareaRef.current.focus()
                          }
                        }}
                        onTouchEnd={(e) => {
                          // Prevent double-tap zoom and ensure focus
                          if (isMobile && textareaRef.current) {
                            e.preventDefault()
                            setTimeout(() => {
                              textareaRef.current?.focus()
                            }, 0)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            if (input.trim()) {
                              handleSubmit(e as any)
                              if (hasMounted) adjustHeight(true)
                            }
                          }
                        }}
                        placeholder="Ask me anything about growing your landscaping business..."
                        className="w-full px-0 py-0 resize-none bg-transparent border-none text-white focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 leading-relaxed text-base"
                        style={{
                          overflow: "hidden",
                          // Set stable initial height to prevent layout shift
                          height: '48px',
                          minHeight: '48px',
                          // Enable smooth scrolling when content overflows
                          scrollBehavior: 'smooth',
                          // Improve mobile touch handling
                          touchAction: isMobile ? 'manipulation' : 'auto'
                        }}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Recording error display */}
                    {recordingError && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-xs flex items-center gap-2">
                          <MicOff className="w-3 h-3" />
                          {recordingError}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {/* Tools Dropdown */}
                        <div className="relative group tools-dropdown-container">
                          <button
                            type="button"
                            onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                            className="group p-2 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-1 text-blue-400"
                            disabled={isLoading}
                          >
                            <Wrench className="w-4 h-4" />
                            <span className="text-xs">Tools</span>
                          </button>
                          
                          {/* Custom Themed Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            Choose tool
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20"></div>
                          </div>
                          
                          {/* Upward Opening Dropdown */}
                          {showToolsDropdown && (
                            <div className="absolute bottom-full left-0 mb-3 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl p-2 space-y-1 min-w-[160px] sm:min-w-40 z-[9999]">
                              <label className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 cursor-pointer ${activeTool === 'attach-file' ? 'bg-blue-500/20' : ''}`}>
                                <Paperclip className="w-4 h-4 sm:w-3 sm:h-3" />
                                <span className="text-xs sm:text-[11px] font-medium">Attach File</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf,.doc,.docx,.txt"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    if (files.length > 0) {
                                      setUploadedFiles(prev => [...prev, ...files])
                                      setActiveTool('attach-file')
                                      setShowToolsDropdown(false)
                                    }
                                  }}
                                  disabled={isLoading}
                                />
                              </label>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  const newState = activeTool === 'web-search' ? null : 'web-search'
                                  setActiveTool(newState)
                                  setWebSearchEnabled(newState === 'web-search')
                                  setShowToolsDropdown(false)
                                }}
                                className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 ${activeTool === 'web-search' ? 'bg-blue-500/20' : ''}`}
                                disabled={isLoading}
                              >
                                <div className="w-4 h-4 sm:w-3 sm:h-3 rounded-full border-2 border-current flex items-center justify-center">
                                  <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-current rounded-full" />
                                </div>
                                <span className="text-xs sm:text-[11px] font-medium">Web Search</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  setActiveTool(activeTool === 'create-image' ? null : 'create-image')
                                  setShowToolsDropdown(false)
                                }}
                                className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 ${activeTool === 'create-image' ? 'bg-blue-500/20' : ''}`}
                                disabled={isLoading}
                              >
                                <ImageIcon className="w-4 h-4 sm:w-3 sm:h-3" />
                                <span className="text-xs sm:text-[11px] font-medium">Create Image</span>
                              </button>
                              
                              <button
                                type="button"
                                className="w-full text-left p-2 sm:p-3 rounded-lg transition-colors flex items-center gap-2 text-blue-400/50 cursor-not-allowed relative"
                                disabled={true}
                                title="Website analysis coming soon!"
                              >
                                <div className="w-4 h-4 sm:w-3 sm:h-3 rounded-full border-2 border-current flex items-center justify-center">
                                  <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-current rounded-full" />
                                </div>
                                <span className="text-xs sm:text-[11px] font-medium">Analyze Website</span>
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] px-1 py-0.5 rounded-full font-medium ml-auto">
                                  Soon
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Active Tool Indicators - Mobile Optimized - Positioned on Right */}
                        {activeTool && (
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-[11px] border border-emerald-500/30">
                              <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-emerald-400 rounded-full" />
                              <span className="font-medium">
                                {activeTool === 'web-search' && 'Web Search'}
                                {activeTool === 'create-image' && 'Create Image'}
                                {activeTool === 'attach-file' && 'Attach File'}
                                {activeTool === 'analyze-website' && 'Analyze Website'}
                              </span>
                              <button
                                onClick={() => {
                                  setActiveTool(null)
                                  setWebSearchEnabled(false)
                                }}
                                className="text-emerald-300 hover:text-white ml-1 p-1 -mr-1 rounded-full hover:bg-emerald-500/20 transition-colors"
                                disabled={isLoading}
                                title="Deactivate tool"
                              >
                                <X className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
                              </button>
                            </div>
                          </div>
                        )}
                        
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
                        {/* Language selector for speech-to-text */}
                        <div className="relative group">
                          <select
                            value={transcriptionLanguage}
                            onChange={(e) => setTranscriptionLanguage(e.target.value as 'auto' | 'en' | 'es')}
                            disabled={isLoading || isRecording || isTranscribing}
                            className="px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-blue-500/50 focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Select transcription language"
                          >
                            <option value="auto">Auto</option>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                          </select>
                        </div>

                        {/* Speech-to-text button - Desktop only */}
                        {!isMobile && (
                          <button
                            type="button"
                            onClick={toggleRecording}
                            disabled={isLoading || isTranscribing}
                          className={`px-1.5 py-1.5 rounded-lg text-sm transition-all duration-300 border flex items-center justify-center ${
                            isRecording
                              ? "bg-red-500 text-white border-red-500 hover:bg-red-400 animate-pulse"
                              : isTranscribing
                              ? "bg-blue-500 text-white border-blue-500"
                              : "text-gray-400 border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
                          }`}
                          title={
                            isRecording 
                              ? "Stop recording" 
                              : isTranscribing 
                              ? "Transcribing..." 
                              : `Start voice message (${transcriptionLanguage === 'auto' ? 'Auto' : transcriptionLanguage === 'en' ? 'English' : 'Spanish'})`
                          }
                        >
                          {isRecording ? (
                            <Square className="w-4 h-4" />
                          ) : isTranscribing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                            <span className="sr-only">
                              {isRecording ? "Stop recording" : "Start voice message"}
                            </span>
                          </button>
                        )}

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

                {/* Business Category Buttons */}
                {!isMobile && (
                  <div className="category-container relative mt-4" style={{ height: '50px' }}>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {BUSINESS_CATEGORIES.map((category, index) => {
                        const IconComponent = category.icon
                        const isActive = activeCategory === category.id
                        // Start from Financial Growth (reverse order) - Financial Growth is typically last in the array
                        const reverseIndex = BUSINESS_CATEGORIES.length - 1 - index
                        const animationDelay = reverseIndex * 150 // 150ms delay between each button
                        
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategorySelect(category.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-500 hover:scale-105 transform ${
                              buttonsAnimated ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'
                            } ${
                              isActive 
                                ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-200' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300 hover:text-emerald-200'
                            }`}
                            style={{
                              transitionDelay: `${animationDelay}ms`
                            }}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="text-xs font-medium">{category.name}</span>
                          </button>
                        )
                      })}
                    </div>
                    
                    {/* Category Questions Dropdown */}
                    {showCategoryQuestions && activeCategory && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"
                          onClick={() => {
                            setShowCategoryQuestions(false)
                            setActiveCategory(null)
                          }}
                        />
                        {/* Modal */}
                        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl p-3 md:p-4 space-y-2 w-[95vw] md:w-[85vw] lg:w-[700px] max-w-3xl z-[999] max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
                        {(() => {
                          const category = BUSINESS_CATEGORIES.find(c => c.id === activeCategory)
                          if (!category) return null
                          
                          return (
                            <>
                              <div className="text-emerald-300 font-medium text-sm flex items-center gap-2 mb-3">
                                <category.icon className="w-4 h-4" />
                                {category.id === 'images' ? (
                                  <div className="flex items-center gap-2">
                                    <span>Images / Visual Ideas</span>
                                    <span className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                                      Upload Image
                                    </span>
                                  </div>
                                ) : (
                                  category.name
                                )}
                              </div>
                              {category.questions.map((question, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleQuestionSelect(question)}
                                  className="w-full text-left p-3 rounded-lg transition-colors hover:bg-emerald-500/10 text-gray-300 hover:text-white text-sm border border-transparent hover:border-emerald-500/20"
                                >
                                  {question}
                                </button>
                              ))}
                            </>
                          )
                        })()}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-3 text-center leading-relaxed">
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
          <div className="absolute right-0 top-14 sm:top-16 lg:top-20 h-[calc(100%-3.5rem)] sm:h-[calc(100%-4rem)] lg:h-[calc(100%-5rem)] w-full sm:w-96 lg:w-[28rem] bg-gradient-to-br from-gray-900 via-gray-950 to-black border-l border-white/10 shadow-2xl overflow-y-auto transform transition-all duration-300 ease-out translate-x-0">
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
                  The more context you provide, the better Scout can help your landscaping business:
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
      
      {/* Fullscreen Image Viewer Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFullscreenImage(null)
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={fullscreenImage.url}
              alt={fullscreenImage.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-0 left-0 right-0 text-center text-white bg-black/70 py-2 rounded-b-lg">
              {fullscreenImage.name}
            </p>
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
