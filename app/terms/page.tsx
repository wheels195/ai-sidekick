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
          <p className="text-gray-400">Effective Date: July 26, 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-6">
            These Terms of Service ("Terms") govern your access to and use of the AI-Sidekick platform ("the Service"), owned and operated by AI-Sidekick. By accessing or using the Service, you agree to these Terms.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">1. Eligibility & Use</h2>
            <p className="text-gray-300 mb-4">
              You must be at least 18 years old to use the Service. You agree to use it only for lawful business purposes and to avoid uploading or requesting harmful, illegal, or offensive content.
            </p>
            <p className="text-gray-300 mb-4">
              You may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Resell, reverse-engineer, or tamper with the Service</li>
              <li>Submit prompts or files that violate these Terms</li>
              <li>Misuse any AI-generated content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">2. User Content & Input</h2>
            <p className="text-gray-300 mb-4">
              You are responsible for any text, data, or files you upload. By submitting content, you grant us a limited license to process it solely for providing AI responses and recommendations.
            </p>
            <p className="text-gray-300 mb-4">
              You may not submit content that is illegal, infringing, abusive, or violates any third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">3. AI Output Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              The Service uses artificial intelligence to generate content (text, images, suggestions, scripts, etc.). While we aim for relevance and accuracy, results may be imperfect, generic, or unsuitable for your specific use case.
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Use generated content at your own discretion.</li>
              <li>You are solely responsible for reviewing, validating, and applying any AI-generated content.</li>
              <li>We are not liable for business losses, misuse, or damages resulting from reliance on AI output.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">4. AI-Generated Images</h2>
            <p className="text-gray-300 mb-4">
              If you use image generation features:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>You are responsible for the prompts and resulting content.</li>
              <li>You must not request or use offensive, explicit, deceptive, or infringing imagery.</li>
              <li>Generated images are for illustrative and non-commercial use unless otherwise permitted.</li>
              <li>We reserve the right to restrict access to this feature at any time.</li>
            </ul>
            <p className="text-gray-300 mb-4">
              AI-Sidekick is not responsible for the legal accuracy or usability of AI-generated visual content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">5. Content Moderation</h2>
            <p className="text-gray-300 mb-4">
              We use automated tools to detect and block:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Offensive or inappropriate prompts</li>
              <li>Fraudulent or abusive behavior</li>
              <li>Attempts to misuse the Service</li>
            </ul>
            <p className="text-gray-300 mb-4">
              We may restrict or suspend accounts found in violation of these standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">6. Subscriptions & Billing</h2>
            <p className="text-gray-300 mb-4">
              Some features may require a paid subscription. You agree to the pricing, billing cycle, and auto-renewal terms presented at the time of sign-up.
            </p>
            <p className="text-gray-300 mb-4">
              Payments are non-refundable except where required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">7. Account Termination</h2>
            <p className="text-gray-300 mb-4">
              You may cancel your account or subscription at any time. We reserve the right to suspend or terminate access if you violate these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-300 mb-4">
              All platform code, models, logic, branding, and AI tools remain the property of AI-Sidekick or its licensors. You may not reproduce, repurpose, or redistribute any part of the platform without prior permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 mb-4">
              To the fullest extent allowed by law:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>We are not liable for indirect, incidental, or consequential damages.</li>
              <li>Our total liability is limited to the amount you paid (if any) in the 12 months prior to a claim.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">10. Governing Law</h2>
            <p className="text-gray-300 mb-4">
              These Terms are governed by the laws of the State of Texas, USA, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300 mb-4">
              We may update these Terms at any time. Continued use of the Service constitutes your agreement to any new or revised terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">📬 Questions or Concerns?</h2>
            <p className="text-gray-300 mb-4">
              Contact us at legal@ai-sidekick.io with any questions related to your account, data, or these policies.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}