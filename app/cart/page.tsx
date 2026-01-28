'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useCart, type CartItem } from '@/hooks/useCart'
import { CartItemRow } from '@/components/shop/CartItemRow'
import { 
  calculateOrderTotal, 
  validatePromoCode,
  getFreeShippingMessage,
} from '@/lib/utils/cart'

export default function CartPage() {
  const { toast } = useToast()
  const { cart, updateQuantity, removeItem } = useCart()
  
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(false)

  useEffect(() => {
    // Fetch cart from localStorage
    const loadCart = () => {
      try {
        const stored = localStorage.getItem('cart')
        if (stored) {
          // useCart already loads from localStorage
        }
      } catch (err) {
        console.error('Failed to load cart:', err)
      }
      setLoading(false)
    }
    
    loadCart()
  }, [])

  // Fetch recommended products
  useEffect(() => {
    const fetchRecommended = async () => {
      setRecommendedLoading(true)
      try {
        const response = await fetch('/api/products?is_featured=true&limit=4')
        if (response.ok) {
          const data = await response.json()
          setRecommendedProducts(data.data.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to fetch recommended products:', err)
      } finally {
        setRecommendedLoading(false)
      }
    }

    fetchRecommended()
  }, [])

  const applyPromoCode = () => {
    setPromoError('')
    setPromoApplied(false)
    
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }

    const result = validatePromoCode(promoCode)
    if (result) {
      setDiscount(result.discount)
      setPromoApplied(true)
      setPromoCode('')
      toast({
        title: 'Promo Code Applied',
        description: `Discount of ${result.discount * 100}% has been applied!`,
        type: 'success',
      })
    } else {
      setPromoError('Invalid promo code. Try: WELCOME20, SAVE10, SUMMER15')
      setDiscount(0)
    }
  }

  // Calculate totals using utility function
  const orderTotal = calculateOrderTotal(cart, discount)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">Loading...</div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 mt-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">Your Selection</h1>
            <p className="text-sm text-muted-foreground mb-8">
              {cart.length} item{cart.length !== 1 ? 's' : ''} currently in your cart
            </p>

            {cart.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center mb-8">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-muted-foreground mb-4 text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Discover our beautiful collection of handcrafted furniture
                </p>
                <Link href="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {cart.map(item => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={() => {
                      removeItem(item.id)
                      toast({
                        title: 'Removed from cart',
                        description: 'Item has been removed from your shopping cart.',
                      })
                    }}
                  />
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <Link href="/products" className="inline-flex items-center gap-2 text-primary hover:underline">
                ← CONTINUE BROWSING
              </Link>
            )}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-lg border bg-white p-6 sticky top-4 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${orderTotal.subtotal.toFixed(2)}</span>
              </div>

              {orderTotal.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                  <span className="font-semibold">-${orderTotal.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Shipping</span>
                <span className="font-semibold">{orderTotal.shipping === 0 ? 'FREE' : `$${orderTotal.shipping.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="font-semibold">${orderTotal.tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary text-xl">${orderTotal.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="mb-6 pb-6 border-b">
              <label className="text-sm font-semibold block mb-3">PROMO CODE</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && applyPromoCode()}
                  placeholder="Enter code"
                  disabled={promoApplied}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm disabled:opacity-50 disabled:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  variant={promoApplied ? "outline" : "default"}
                  size="sm"
                  onClick={applyPromoCode}
                  disabled={promoApplied}
                  className="whitespace-nowrap"
                >
                  {promoApplied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Applied
                    </>
                  ) : (
                    'APPLY'
                  )}
                </Button>
              </div>
              {promoError && (
                <div className="flex items-center gap-2 text-red-600 text-xs mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {promoError}
                </div>
              )}
              {promoApplied && (
                <div className="flex items-center gap-2 text-green-600 text-xs mt-2">
                  <Check className="w-3 h-3" />
                  Promo code applied successfully!
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Try: WELCOME20, SAVE10, SUMMER15, or VIPFREE
              </p>
            </div>

            <Link href="/checkout" className="w-full block mb-3">
              <Button className="w-full" size="lg" disabled={cart.length === 0}>
                PROCEED TO CHECKOUT →
              </Button>
            </Link>

            <Link href="/products" className="w-full block">
              <Button variant="outline" className="w-full" size="lg">
                CONTINUE SHOPPING
              </Button>
            </Link>

            <div className="mt-6 space-y-3 pt-6 border-t text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span>🔒</span>
                <span>Secure SSL encrypted checkout</span>
              </div>
              <div className="flex gap-2">
                <span>↩️</span>
                <span>Free returns within 30 days</span>
              </div>
              <div className="flex gap-2">
                <span>✓</span>
                <span>100% Money-back guarantee</span>
              </div>
              {orderTotal.subtotal < 500 && orderTotal.subtotal > 0 && (
                <div className="flex gap-2 bg-blue-50 -mx-4 -mb-3 p-3 mt-3 rounded-b-lg border-t border-blue-200">
                  <span>ℹ️</span>
                  <span className="text-blue-700 font-medium">
                    {getFreeShippingMessage(orderTotal.subtotal)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        {cart.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
            {recommendedLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-lg bg-muted h-64 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {recommendedProducts.map(product => (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3 mb-4">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary mt-2">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      Add to Cart
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
