'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import Loading from './loading'
import { Check, Package, Truck, MapPin, Mail, Phone, Download, ArrowRight } from 'lucide-react'

interface OrderData {
  id: string
  order_number: string
  items: Array<{
    name: string
    price: number
    quantity: number
    image_url: string
  }>
  customer: {
    firstName: string
    lastName: string
    street: string
    city: string
    zipCode: string
    state: string
    country: string
    email: string
    phone: string
  }
  payment: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
  createdAt: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const response = await fetch(`/api/orders/${orderId}`)
          if (response.ok) {
            const data = await response.json()
            setOrder(data)
          }
        } catch (error) {
          console.error('Failed to fetch order:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchOrder()
    }
  }, [orderId])

  // Fetch recommended products
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await fetch('/api/products?is_featured=true&limit=4')
        if (response.ok) {
          const data = await response.json()
          setRecommendedProducts(data.data.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to fetch recommended products:', err)
      }
    }

    fetchRecommended()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6 animate-bounce">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Thank you for your order!</h1>
          <p className="text-lg text-muted-foreground mb-2">Order #{orderId}</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your home is about to become more beautiful. A confirmation email with full tracking details has been sent to your inbox.
          </p>
        </div>

        <Suspense fallback={<Loading />}>
          {order && (
            <>
              {/* Order Timeline */}
              <div className="mb-12 bg-white rounded-lg border p-8">
                <h2 className="text-lg font-semibold mb-6">Order Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { icon: Check, label: 'Order Confirmed', status: 'completed' },
                    { icon: Package, label: 'Processing', status: 'pending' },
                    { icon: Truck, label: 'Shipped', status: 'pending' },
                    { icon: Check, label: 'Delivered', status: 'pending' },
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          step.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-center">{step.label}</p>
                        {step.status === 'completed' && (
                          <p className="text-xs text-green-600 mt-1">Done</p>
                        )}
                      </div>
                      {idx < 3 && (
                        <div className="absolute top-6 -right-2 w-full h-0.5 bg-muted" style={{
                          backgroundColor: step.status === 'completed' ? '#10b981' : undefined
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
                          <Image
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-primary mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Payment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between pb-3 border-b">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${order.payment.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">
                        {order.payment.shipping === 0 ? 'FREE' : `$${order.payment.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">${order.payment.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">${order.payment.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Name</p>
                      <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Email</p>
                      <p className="font-medium">{order.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Phone</p>
                      <p className="font-medium">{order.customer.phone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium">{order.customer.street}</p>
                    <p className="text-muted-foreground">
                      {order.customer.city}, {order.customer.state} {order.customer.zipCode}
                    </p>
                    <p className="text-muted-foreground">{order.customer.country}</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">
                        📦 Estimated Delivery: {(() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 7);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 py-8 border-y">
                <div className="text-center">
                  <div className="text-3xl mb-3">✓</div>
                  <h3 className="font-semibold mb-2">Authenticity Guaranteed</h3>
                  <p className="text-sm text-muted-foreground">
                    Every piece comes with a signed certificate of craftsmanship
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🚚</div>
                  <h3 className="font-semibold mb-2">White Glove Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Our experts handle everything from delivery to assembly
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🌱</div>
                  <h3 className="font-semibold mb-2">Sustainable Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Sustainably sourced materials and eco-friendly finishes
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
                <Link href="/products">
                  <Button size="lg" className="flex items-center gap-2">
                    Continue Shopping
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Recommended Products */}
              {recommendedProducts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Customers Also Loved</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {recommendedProducts.map(product => (
                      <Link key={product.id} href={`/products/${product.slug}`} className="group">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
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
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Our customer support team is here to help with any questions about your order.
                </p>
                <Link href="/contact">
                  <Button variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </>
          )}

          {!order && !loading && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find your order. Please check your order ID and try again.
              </p>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
