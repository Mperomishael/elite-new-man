"use client"

import { useState } from "react"
import { BookOpen, ExternalLink } from "lucide-react"

export function TermsView() {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const termsData = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      id: "use-license",
      title: "2. Use License",
      content:
        "Permission is granted to temporarily download one copy of the materials (information or software) on our platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile, disassemble, or reverse engineer any software contained on the platform; remove any copyright or other proprietary notations from the materials; transfer the materials to another person or 'mirror' the materials on any other server.",
    },
    {
      id: "disclaimer",
      title: "3. Disclaimer",
      content:
        "The materials on our platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
    },
    {
      id: "limitations",
      title: "4. Limitations",
      content:
        "In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.",
    },
    {
      id: "accuracy",
      title: "5. Accuracy of Materials",
      content:
        "The materials appearing on our platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our platform are accurate, complete, or current. We may make changes to the materials contained on our platform at any time without notice.",
    },
    {
      id: "links",
      title: "6. External Links",
      content:
        "We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.",
    },
    {
      id: "modifications",
      title: "7. Modifications",
      content:
        "We may revise these terms of service for our platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.",
    },
    {
      id: "governing-law",
      title: "8. Governing Law",
      content:
        "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which our company operates, and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.",
    },
    {
      id: "trading-risk",
      title: "9. Trading Risk Disclosure",
      content:
        "Trading and investment activities carry substantial risk of loss. Past performance is not indicative of future results. Before investing, carefully consider your investment objectives, level of experience, and risk appetite. You should not invest money that you cannot afford to lose.",
    },
    {
      id: "contact",
      title: "10. Contact Information",
      content:
        "If you have any questions about these Terms and Conditions, please contact us through our support system or email address listed on the platform.",
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-lime-400" />
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        </div>
        <p className="text-neutral-400">
          Please read these terms carefully. Your access to and use of our platform constitutes your agreement to be
          bound by these terms.
        </p>
      </div>

      {/* Last Updated */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
        <p className="text-xs text-neutral-400">
          <span className="font-semibold">Last Updated:</span> November 27, 2025
        </p>
      </div>

      {/* Terms Accordion */}
      <div className="space-y-3">
        {termsData.map((section) => (
          <div key={section.id} className="border border-neutral-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 bg-neutral-900/50 hover:bg-neutral-900 transition-colors"
            >
              <h3 className="font-semibold text-left">{section.title}</h3>
              <div
                className={`flex-shrink-0 transition-transform duration-300 ${
                  expandedSections.includes(section.id) ? "rotate-180" : ""
                }`}
              >
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>

            {expandedSections.includes(section.id) && (
              <div className="px-4 py-3 bg-black border-t border-neutral-800">
                <p className="text-sm text-neutral-300 leading-relaxed">{section.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Acceptance Checkbox */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-5 h-5 rounded bg-neutral-800 border border-neutral-600 checked:bg-lime-400 checked:border-lime-400 cursor-pointer mt-0.5 accent-lime-400"
          />
          <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
            I have read and agree to the Terms & Conditions
          </span>
        </label>
      </div>

      {/* Support Contact */}
      <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-lime-400">Questions or Concerns?</p>
        <p className="text-xs text-blue-200 mb-2">If you have any questions about our Terms & Conditions, please contact us.</p>
        <button className="inline-flex items-center gap-2 text-xs font-semibold text-lime-400 hover:text-lime-400 transition-colors">
          <ExternalLink className="w-3 h-3" />
          Contact Support
        </button>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-neutral-500 bg-neutral-900/30 rounded-lg p-3">
        <p>These Terms & Conditions are subject to change without notice. Continued use of the platform implies acceptance of any changes.</p>
      </div>
    </div>
  )
}
