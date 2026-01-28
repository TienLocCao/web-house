"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { cart } = useCart()
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-serif font-bold text-foreground">
            Laroa Studio
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/products">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Shop Now</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start relative">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart
                  {mounted && cartCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full mt-4">Shop Now</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
