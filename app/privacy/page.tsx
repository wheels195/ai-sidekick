"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Effective Date: January 11, 2025</p>
          <p className="text-gray-400">Last Updated: July 10, 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4">
              To provide and improve AI Sidekick during your trial, we collect:
            </p>
            
            <h3 className="text-xl font-medium text-white mb-3">Information You Provide:</h3>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Email address and basic account info</li>
              <li>Business details (trade type, location, team size, services offered)</li>
              <li>Chat conversations and questions you ask the AI</li>
              <li>Feedback on AI responses (emoji reactions, ratings)</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">Automatically Collected:</h3>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Browser and device info</li>
              <li>IP address and general location (city-level only)</li>
              <li>Session length and activity patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Deliver AI responses tailored to your trade and business</li>
              <li>Improve our product through usage and feedback</li>
              <li>Analyze performance to make the app better</li>
              <li>Send occasional updates about your trial</li>
            </ul>
            <p className="text-gray-300 mb-4">
              <strong>We do not sell your data, use it for advertising, or share it outside of our trusted infrastructure partners.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">3. AI Technology & Infrastructure</h2>
            <p className="text-gray-300 mb-4">
              We use the following services to run AI Sidekick:
            </p>
            
            <p className="text-gray-300 mb-2">
              <strong>OpenAI (GPT-4o-mini)</strong> – To generate responses from the chatbot. Conversations are processed securely, and we do not allow OpenAI to use your data to train their models.
            </p>

            <p className="text-gray-300 mb-2">
              <strong>Supabase</strong> – To store your business profile, chat history, and feedback securely.
            </p>

            <p className="text-gray-300 mb-4">
              <strong>Resend</strong> – To send trial-related and system emails.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">4. Data Security</h2>
            <p className="text-gray-300 mb-4">
              We protect your data using:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure storage with row-level security (RLS) in Supabase</li>
              <li>Strong password hashing and token-based authentication</li>
              <li>No ad tracking, no third-party analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">5. Data Use During Trial</h2>
            <p className="text-gray-300 mb-4">
              Your data helps us personalize your AI experience and understand how to make the product better. This includes:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Using your business context (location, services) to tailor responses</li>
              <li>Logging which types of responses are most useful across trades</li>
              <li>Storing anonymous patterns for improving system-wide answers</li>
            </ul>
            <p className="text-gray-300 mb-4">
              We retain your data only during your trial unless you choose to continue. If you stop using the service, we'll automatically delete your account data after 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-4">
              Even during the trial, you can:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Request access to the information we store</li>
              <li>Request deletion of your data at any time</li>
              <li>Ask questions about how your data is used</li>
            </ul>
            <p className="text-gray-300 mb-4">
              Contact us at hello@aisidekick.com for any privacy-related request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-300 mb-4">
              AI Sidekick is for businesses only. We do not knowingly collect personal information from anyone under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">8. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              For privacy concerns or questions:
            </p>
            <p className="text-gray-300 mb-2">
              Email: hello@aisidekick.com
            </p>
            <p className="text-gray-300">
              We respond to privacy-related inquiries within 48 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}