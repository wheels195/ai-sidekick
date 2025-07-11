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
          <p className="text-gray-400">Last updated: January 11, 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4">
              We collect information to provide and improve our AI Sidekick service:
            </p>
            
            <h3 className="text-xl font-medium text-white mb-3">Information You Provide:</h3>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Account information (email, business name, trade type)</li>
              <li>Business profile details (services, team size, challenges)</li>
              <li>Chat conversations and messages</li>
              <li>Feedback and ratings on AI responses</li>
              <li>Files and documents you upload (when available)</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">Information Automatically Collected:</h3>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Device and browser information</li>
              <li>Usage patterns and interaction data</li>
              <li>Session duration and engagement metrics</li>
              <li>IP address and general location information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">
              We use collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Provide personalized AI business advice and recommendations</li>
              <li>Improve our AI models and service quality</li>
              <li>Store and retrieve your conversation history</li>
              <li>Send important account and service updates</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">3. Third-Party Services</h2>
            <p className="text-gray-300 mb-4">
              AI Sidekick integrates with trusted third-party services:
            </p>
            
            <h3 className="text-xl font-medium text-white mb-3">OpenAI:</h3>
            <p className="text-gray-300 mb-2">
              We use OpenAI's GPT models to generate AI responses. Your conversations may be processed by OpenAI's systems according to their privacy policy.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">Supabase:</h3>
            <p className="text-gray-300 mb-2">
              We use Supabase for secure database storage of your account information, conversations, and business profile data.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">Resend:</h3>
            <p className="text-gray-300 mb-4">
              We use Resend for sending account verification and important service emails.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">4. Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Encrypted data transmission using HTTPS</li>
              <li>Secure password hashing (SHA-256)</li>
              <li>JWT-based authentication with HTTP-only cookies</li>
              <li>Row Level Security (RLS) in our database</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">5. Learning and Improvement</h2>
            <p className="text-gray-300 mb-4">
              We use a two-layer learning system to improve our service:
            </p>
            
            <h3 className="text-xl font-medium text-white mb-3">Individual Learning:</h3>
            <p className="text-gray-300 mb-2">
              Your specific preferences and patterns are stored to personalize your experience.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">Global Learning:</h3>
            <p className="text-gray-300 mb-4">
              Anonymized and aggregated data helps improve AI responses for all users. No personally identifiable information is included in global learning.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">6. Data Retention</h2>
            <p className="text-gray-300 mb-4">
              We retain your data as follows:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Account information: Until account deletion</li>
              <li>Conversation history: Until account deletion or manual deletion</li>
              <li>Learning data: Anonymized data may be retained for service improvement</li>
              <li>Session data: 30 days for security and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Access your personal data stored in our systems</li>
              <li>Update or correct your account information</li>
              <li>Delete your account and associated data</li>
              <li>Export your conversation history</li>
              <li>Opt out of certain data collection practices</li>
              <li>Request clarification about our data practices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-emerald-400 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-300 mb-4">
              We use essential cookies for:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>User authentication and session management</li>
              <li>Security and fraud prevention</li>
              <li>Basic analytics to improve service performance</li>
            </ul>
            <p className="text-gray-300 mb-4">
              We do not use advertising or tracking cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-300 mb-4">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-300 mb-4">
              AI Sidekick is intended for business use and is not designed for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">11. Changes to Privacy Policy</h2>
            <p className="text-gray-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes via email or through the service. Your continued use after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">12. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-gray-300 mb-2">
              Email: hello@aisidekick.com
            </p>
            <p className="text-gray-300">
              We aim to respond to privacy inquiries within 48 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}