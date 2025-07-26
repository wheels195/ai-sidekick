import React from 'react'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-emerald-400">AI Sidekick</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white">Pricing</a>
              <a href="/landscaping" className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Grow Your <span className="text-emerald-400">Landscaping Business</span> with AI
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Get instant business intelligence, competitor analysis, and growth strategies 
            tailored specifically for your landscaping company.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/landscaping"
              className="inline-flex items-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              Start Chat Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center px-8 py-4 border border-gray-600 hover:border-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
              View Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Landscaping Businesses</h2>
            <p className="text-xl text-gray-300">Everything you need to outcompete and outgrow your competition</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-xl">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Local Market Intelligence</h3>
              <p className="text-gray-300">
                Get real-time competitor analysis, pricing insights, and market opportunities 
                specific to your ZIP code and service area.
              </p>
            </div>
            
            <div className="bg-gray-900 p-8 rounded-xl">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Revenue Optimization</h3>
              <p className="text-gray-300">
                Discover upselling opportunities, optimize pricing strategies, and create 
                high-margin service packages tailored to your market.
              </p>
            </div>
            
            <div className="bg-gray-900 p-8 rounded-xl">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Image Analysis</h3>
              <p className="text-gray-300">
                Upload photos of properties, competitor materials, or quotes for instant 
                business insights and improvement recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join landscaping businesses already using AI Sidekick to increase revenue and outcompete their competition.
          </p>
          <a
            href="/landscaping"
            className="inline-flex items-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-6 w-6" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-emerald-400 mb-4">AI Sidekick</h3>
            <p className="text-gray-400">
              Specialized AI business intelligence for landscaping companies
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}