"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: January 11, 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 mb-4">
              By accessing and using AI Sidekick ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">2. Description of Service</h2>
            <p className="text-gray-300 mb-4">
              AI Sidekick provides specialized AI-powered business growth assistance for local trade businesses including landscaping, electrical, HVAC, plumbing, roofing, pest control, and general contracting services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">3. User Accounts and Registration</h2>
            <p className="text-gray-300 mb-4">
              To access certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">4. Use of Service</h2>
            <p className="text-gray-300 mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Share inappropriate or harmful content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">5. AI-Generated Content</h2>
            <p className="text-gray-300 mb-4">
              The Service uses artificial intelligence to generate business advice and recommendations. You understand that:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>AI-generated content is for informational purposes only</li>
              <li>You should verify and adapt advice to your specific situation</li>
              <li>AI Sidekick does not guarantee the accuracy or effectiveness of AI responses</li>
              <li>You are responsible for your business decisions based on AI recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">6. Privacy and Data</h2>
            <p className="text-gray-300 mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">7. Billing and Payment</h2>
            <p className="text-gray-300 mb-4">
              For paid plans, you agree to pay all fees associated with your subscription. Billing is handled through secure third-party payment processors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">8. Cancellation and Refunds</h2>
            <p className="text-gray-300 mb-4">
              You may cancel your subscription at any time. Refund policies apply as follows:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Free plans can be canceled immediately without charge</li>
              <li>Paid plans may be eligible for pro-rated refunds within 30 days</li>
              <li>Contact support for specific refund requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-300 mb-4">
              The Service and its original content, features, and functionality are owned by AI Sidekick and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-gray-300 mb-4">
              The Service is provided "as is" without warranties of any kind, either express or implied. AI Sidekick does not warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-300 mb-4">
              In no event shall AI Sidekick be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">12. Termination</h2>
            <p className="text-gray-300 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-300 mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance of new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">14. Contact Information</h2>
            <p className="text-gray-300 mb-4">
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-300">
              Email: hello@aisidekick.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}