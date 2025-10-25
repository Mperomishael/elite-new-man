"use client"

import { Mail, Send, MessageSquare, Clock, MessageCircle } from "lucide-react"
import { useState } from "react"

export function SupportView() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const whatsappNumber = "+27715403179"
  const whatsappMessage = "Hello, USTrader, I need help"

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodedMessage}`, "_blank")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-lime-400" />
        <div>
          <h2 className="text-2xl font-bold">Customer Support</h2>
          <p className="text-sm text-slate-400">We're here to help you</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={handleWhatsAppClick}
          className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-95"
        >
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs text-green-100">WhatsApp Support</p>
            <p className="font-semibold text-white">{whatsappNumber}</p>
          </div>
        </button>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-blue-100">Email Us</p>
            <p className="font-semibold text-white">support@ultimatestcktrader.online</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Response Time</p>
            <p className="font-semibold text-white">Within 24 hours</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Send us a message</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What can we help you with?"
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              rows={6}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none"
            />
          </div>

          <button className="w-full bg-lime-400 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Send className="w-5 h-5" />
            Send Message
          </button>
        </div>
      </div>

      {/* FAQ Quick Links */}
      <div className="bg-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Quick Help</h3>
        <div className="space-y-2">
          <QuickHelpButton icon={MessageSquare} title="How to deposit funds?" />
          <QuickHelpButton icon={MessageSquare} title="How to withdraw earnings?" />
          <QuickHelpButton icon={MessageSquare} title="KYC verification process" />
          <QuickHelpButton icon={MessageSquare} title="Trading fees and charges" />
        </div>
      </div>
    </div>
  )
}

function QuickHelpButton({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <button className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-xl p-4 flex items-center gap-3 transition-colors text-left">
      <Icon className="w-5 h-5 text-lime-400" />
      <span className="text-sm text-white">{title}</span>
    </button>
  )
}
