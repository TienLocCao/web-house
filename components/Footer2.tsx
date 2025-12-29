"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"

export function Footer() {
  const { toast } = useToast()
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false)

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingNewsletter(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      })
      setNewsletterEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingNewsletter(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingContact(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit")
      }

      toast({
        title: "Success!",
        description: "Your message has been sent. We'll get back to you soon.",
      })
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingContact(false)
    }
  }

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Get In Touch</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Phone (Optional)"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Input
                  placeholder="Subject (Optional)"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
              </div>
              <Textarea
                placeholder="Your Message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                rows={5}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button
                type="submit"
                disabled={isSubmittingContact}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                {isSubmittingContact ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Newsletter & Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">Subscribe to Our Newsletter</h3>
              <p className="opacity-80 mb-4">Get the latest updates on new products and upcoming sales.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button
                  type="submit"
                  disabled={isSubmittingNewsletter}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  {isSubmittingNewsletter ? "..." : "Subscribe"}
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-3">Contact Info</h4>
                <ul className="space-y-2 text-sm opacity-80">
                  <li>Email: info@laroastudio.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Design Street</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#home" className="opacity-80 hover:opacity-100 transition-opacity">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="#categories" className="opacity-80 hover:opacity-100 transition-opacity">
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link href="#top-selling" className="opacity-80 hover:opacity-100 transition-opacity">
                      Projects
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-80">© 2025 Laroa Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Privacy Statement
            </Link>
            <Link href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
