"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles, TrendingUp, Users, Target, Zap, Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LearnPage() {
  const questionCategories = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Customer Acquisition & Lead Generation",
      color: "from-emerald-500 to-teal-500",
      questions: [
        "Generate a 30-day plan to get 10 new high-value customers",
        "Write a referral program that gets my best customers recommending me",
        "Create a door-to-door script for neighborhoods with dead lawns",
        "How do I get commercial property management contracts?",
        "What's the best way to approach new construction builders?",
        "Write a compelling Nextdoor post that generates landscape leads",
        "Create a lead magnet offer that attracts homeowners ready to spend",
        "How do I turn one-time customers into recurring maintenance clients?",
        "Design a follow-up sequence for leads who didn't hire me yet",
        "What's the most effective way to network with real estate agents?"
      ]
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Revenue Growth & Premium Pricing",
      color: "from-blue-500 to-indigo-500",
      questions: [
        "How do I upsell lawn care customers into full landscape design?",
        "What high-margin services should I add to double my profit?",
        "Create a proposal template that wins 70% of my bids",
        "How do I justify premium pricing to price-sensitive customers?",
        "Design a maintenance package that maximizes monthly recurring revenue",
        "What's the best way to present add-on services during estimates?",
        "How do I position myself as the premium option in my market?",
        "Create a pricing strategy that eliminates lowball competitors",
        "What seasonal services can I offer to increase winter revenue?",
        "How do I bundle services to increase average project value?"
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Competitive Advantage & Market Domination",
      color: "from-purple-500 to-pink-500",
      questions: [
        "Analyze my competitor's website - what are they doing better?",
        "Create a unique selling proposition that sets me apart completely",
        "How do I steal market share from the biggest landscaper in town?",
        "What services are my competitors NOT offering that I should?",
        "How do I position against companies that compete on price?",
        "Create a strategy to become the go-to landscaper in my zip code",
        "What makes customers choose one landscaper over another?",
        "How do I differentiate when everyone offers the same services?",
        "Design a competitive analysis framework for my market",
        "What's the best way to respond when customers mention competitors?"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Scaling & Team Building",
      color: "from-orange-500 to-red-500",
      questions: [
        "How do I hire my first reliable crew member?",
        "What questions reveal if someone will be a dependable worker?",
        "Create a training system for new landscape employees",
        "How do I manage multiple crews without being everywhere?",
        "What's the best way to incentivize crew performance and quality?",
        "How do I scale from solo operator to managing 3+ crews?",
        "Create job descriptions that attract quality landscaping talent",
        "What equipment investments will help me handle bigger jobs?",
        "How do I delegate without sacrificing quality standards?",
        "Design a compensation structure that reduces employee turnover"
      ]
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Marketing & Reputation Building",
      color: "from-yellow-500 to-orange-500",
      questions: [
        "Write 20 social media posts showcasing my recent projects",
        "How do I get 50+ Google reviews from happy customers?",
        "Create a content calendar for year-round landscaping marketing",
        "What's the best way to showcase before/after transformations?",
        "How do I build a reputation as the local landscaping expert?",
        "Create email campaigns that keep me top-of-mind with customers",
        "What local SEO strategies will help me rank #1 in my area?",
        "How do I leverage customer success stories for more business?",
        "Design a photography strategy that sells my landscaping work",
        "What partnerships can help me reach more potential customers?"
      ]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Business Operations & Efficiency",
      color: "from-teal-500 to-cyan-500",
      questions: [
        "How do I schedule jobs to maximize efficiency and profit?",
        "Create a system to track profitability by service type",
        "What's the best way to handle difficult or demanding customers?",
        "How do I streamline estimates to close deals faster?",
        "Design a follow-up system that ensures customer satisfaction",
        "What software tools will help me manage my growing business?",
        "How do I reduce no-shows and last-minute cancellations?",
        "Create a quality control checklist for every completed job",
        "What's the most efficient route planning for maintenance clients?",
        "How do I handle weather delays without losing money?"
      ]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Seasonal Strategy & Year-Round Revenue",
      color: "from-green-500 to-emerald-500",
      questions: [
        "Plan my winter strategy to keep revenue flowing year-round",
        "How do I pre-book spring customers during slow season?",
        "What holiday services can I offer for December revenue?",
        "Create a fall cleanup marketing campaign that books solid",
        "How do I prepare customers for spring with advance planning?",
        "What winter services are most profitable in cold climates?",
        "Design a seasonal maintenance program customers love",
        "How do I use slow season to set up next year's growth?",
        "What equipment should I invest in for year-round work?",
        "Create a seasonal pricing strategy that maximizes profit"
      ]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Premium Service Expansion",
      color: "from-indigo-500 to-purple-500",
      questions: [
        "Should I expand into irrigation? Pros and cons for my market",
        "How do I add hardscaping services profitably?",
        "What's the ROI on offering landscape lighting installation?",
        "Should I get into tree service or partner with someone?",
        "How do I transition from maintenance-only to design-build?",
        "What certifications would help me charge premium rates?",
        "Create a strategy to become a full-service outdoor specialist",
        "How do I evaluate new service opportunities?",
        "What's the best way to test demand for new services?",
        "How do I train my team on premium service delivery?"
      ]
    }
  ]

  return (
    <>
      <style>{`
        .font-cursive {
          font-family: var(--font-cursive), 'Brush Script MT', cursive;
        }
      `}</style>
      <div className="min-h-screen bg-black text-white">
        {/* Header Navigation */}
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

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-4 py-2"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
                
                <Button
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-2 whitespace-nowrap"
                  onClick={() => window.location.href = '/signup'}
                >
                  Start Free Trial
                  <Sparkles className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Back Button */}
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-gray-800/50 mb-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  75+ Questions to Transform
                </span>
                <br />
                Your Landscaping Business
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Learn how to get the best out of AI Sidekick. Real questions from real business owners. 
                Get personalized strategies and ideas for your specific market.
              </p>
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-600/30 rounded-xl p-4 inline-block">
                <p className="text-emerald-400 font-semibold">
                  💡 These are inspiration questions - sign up to get personalized answers for YOUR business
                </p>
              </div>
            </div>

            {/* Question Categories */}
            <div className="space-y-12">
              {questionCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-gray-800/40 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mr-4 shadow-lg`}>
                      {category.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.questions.map((question, questionIndex) => (
                      <div 
                        key={questionIndex}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                      >
                        <p className="text-gray-200 leading-relaxed">
                          "{question}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16 bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-emerald-500/20 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to get personalized answers for <span className="text-emerald-400">YOUR</span> business?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start your free trial and get specific strategies for your market, competition, and business goals.
              </p>
              <Button
                onClick={() => window.location.href = '/signup?plan=free-trial'}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-lg px-12 py-6 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial - No Credit Card Required
                <Sparkles className="ml-3 w-5 h-5" />
              </Button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-600/30 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div
                className="flex items-center space-x-3 mb-6 md:mb-0 group cursor-pointer"
                onClick={() => (window.location.href = "/")}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-cursive cursor-pointer hover:scale-105 transition-transform duration-300">
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
                <a href="/contact" className="hover:text-white transition-all duration-300 hover:scale-105">
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