"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create mailto link with form data
    const subject = formData.subject || 'Contact from AI Sidekick Website'
    const body = `Name: ${formData.name}
Business: ${formData.business}
Email: ${formData.email}

Message:
${formData.message}`

    const mailtoLink = `mailto:hello@aisidekick.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open user's email client
    window.location.href = mailtoLink
    setIsSubmitted(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-gray-800/50 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-gray-400 text-lg">
              Questions about AI Sidekick? We'd love to hear from you.
            </p>
          </div>
        </div>

        {!isSubmitted ? (
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
              <p className="text-gray-300">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business/Trade
                  </label>
                  <Input
                    type="text"
                    name="business"
                    value={formData.business}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25"
                    placeholder="e.g., Johnson's Landscaping, ABC Electrical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/25 resize-none"
                    placeholder="Tell us about your question, feedback, or how we can help..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 py-3"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Message Sent!</h2>
              <p className="text-gray-300 mb-6">
                Your email client should have opened with your message. If it didn't, you can reach us directly at{" "}
                <a href="mailto:hello@aisidekick.com" className="text-emerald-400 hover:text-emerald-300">
                  hello@aisidekick.com
                </a>
              </p>
              <p className="text-gray-400 text-sm">
                We typically respond within 24 hours.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Other Ways to Reach Us</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <a 
              href="mailto:hello@aisidekick.com"
              className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>hello@aisidekick.com</span>
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Response time: Within 24 hours • Available: Monday-Friday
          </p>
        </div>
      </div>
    </div>
  )
}