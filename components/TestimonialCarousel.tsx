'use client'

import React, { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  Search, 
  Snowflake, 
  Building2, 
  BarChart3, 
  Rocket, 
  Clock, 
  DollarSign,
  Lightbulb,
  MessageCircle,
  GraduationCap,
  Globe,
  ClipboardCheck,
  Briefcase,
  Target
} from 'lucide-react'

interface TestimonialStat {
  icon: React.ReactNode
  text: string
}

interface Testimonial {
  imageSrc: string
  headline: string
  subheadline: string
  stats: TestimonialStat[]
  footer: string
}

interface TestimonialCarouselProps {
  testimonials?: Testimonial[]
}

// Testimonial data with unique value cards for each slide
const placeholderTestimonials: Testimonial[] = [
  {
    imageSrc: '/testimonial-1.jpg',
    headline: 'Scout finds money in the places you overlook',
    subheadline: 'From upsell ideas to smarter customer follow-ups, Scout gives landscapers like Bob an edge — without the stress of doing it alone.',
    stats: [
      { icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, text: '3 Personalized Upsell Ideas based on services Bob already offers' },
      { icon: <Users className="w-5 h-5 text-emerald-400" />, text: '2x Follow-Up Rate using built-in text and email templates' },
      { icon: <Search className="w-5 h-5 text-emerald-400" />, text: 'Nearby Business Comparison to improve pricing and sales pitches' }
    ],
    footer: 'Solo operator | Residential focus | 5+ years in business'
  },
  {
    imageSrc: '/testimonial-2.jpg',
    headline: 'More Upsells. Better Marketing. Less Time Wasted.',
    subheadline: 'Your team doesn\'t need to be tech-savvy to grow fast. With AI-Sidekick, landscaping pros are:',
    stats: [
      { icon: <Clock className="w-5 h-5 text-emerald-400" />, text: 'Saving 5–10 hours/week on customer follow-ups and content creation' },
      { icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, text: 'Increasing upsell revenue with smart, timely recommendations' },
      { icon: <MessageCircle className="w-5 h-5 text-emerald-400" />, text: 'Posting 3x more often on social — without writer\'s block' }
    ],
    footer: 'Medium-sized crew | Full-service landscaping | East Coast region'
  },
  {
    imageSrc: '/testimonial-3.jpg',
    headline: 'Teamwide Readiness, Every Job',
    subheadline: 'Your crew doesn\'t need to be tech experts to work smarter. With AI-Sidekick, landscaping teams are:',
    stats: [
      { icon: <GraduationCap className="w-5 h-5 text-emerald-400" />, text: 'Onboarding new crew members faster — no manuals, just answers on demand' },
      { icon: <Globe className="w-5 h-5 text-emerald-400" />, text: 'Communicating clearly across English, Spanish & 50+ languages' },
      { icon: <ClipboardCheck className="w-5 h-5 text-emerald-400" />, text: 'Showing up more prepared, with AI-generated daily prep checklists' }
    ],
    footer: 'Enterprise solution | Multi-crew operations | Nationwide'
  },
  {
    imageSrc: '/testimonial-4.jpg',
    headline: 'Bigger Deals, Better Growth',
    subheadline: 'Whether you\'re solo or scaling, AI-Sidekick helps landscaping pros:',
    stats: [
      { icon: <Briefcase className="w-5 h-5 text-emerald-400" />, text: 'Win more commercial contracts with AI-powered pitch ideas and templates' },
      { icon: <Lightbulb className="w-5 h-5 text-emerald-400" />, text: 'Diversify service offerings with smart suggestions based on local demand' },
      { icon: <Target className="w-5 h-5 text-emerald-400" />, text: 'Stay focused on growth by automating research and customer prep' }
    ],
    footer: 'Growth-focused | Commercial & residential | Multi-state operations'
  }
]

export default function TestimonialCarousel({ testimonials = placeholderTestimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation on index change
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Main carousel container */}
      <div 
        className="relative overflow-hidden rounded-xl lg:rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Testimonial content */}
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12 p-6 sm:p-8 lg:p-12">
          
          {/* Left side - Testimonial Image */}
          <div className="flex-shrink-0 w-full lg:w-auto order-1 lg:order-1">
            <img
              src={currentTestimonial.imageSrc}
              alt={`Testimonial ${currentIndex + 1}`}
              className={`mx-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:w-[550px] lg:h-[550px] xl:w-[650px] xl:h-[650px] object-cover rounded-xl lg:rounded-2xl transition-all duration-600 ease-out ${
                isAnimating ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'
              }`}
            />
          </div>

          {/* Right side - Dynamic Value Card */}
          <div className="flex-1 w-full order-2 lg:order-2">
            <div className={`bg-gradient-to-br from-emerald-900/20 via-emerald-800/15 to-emerald-700/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-10 shadow-2xl border border-emerald-400/30 transition-all duration-600 ease-out relative overflow-hidden ${
              isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
            }`}>
              {/* Glassy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-emerald-400/5 pointer-events-none" />
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-xl lg:rounded-2xl blur-lg opacity-50 -z-10" />
              
              {/* Content with higher z-index */}
              <div className="relative z-10">
              {/* Headline */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
                {currentTestimonial.headline}
              </h3>
              
              {/* Subheadline */}
              <p className="text-gray-100 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 font-medium">
                {currentTestimonial.subheadline}
              </p>
              
              {/* Stats with icons */}
              <div className="space-y-5 mb-6 sm:mb-8">
                {currentTestimonial.stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 shadow-sm">
                      {stat.icon}
                    </div>
                    <p className="text-gray-100 text-base leading-relaxed font-medium tracking-wide">
                      {stat.text}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Footer meta info */}
              <div className="pt-4 sm:pt-6 border-t border-emerald-400/30">
                <p className="text-emerald-200 text-sm font-semibold tracking-wide">
                  {currentTestimonial.footer}
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-emerald-400 w-6 sm:w-8' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}