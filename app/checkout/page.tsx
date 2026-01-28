'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, MapPin, Package } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useCart, type CartItem } from '@/hooks/useCart'
import { calculateOrderTotal } from '@/lib/utils/cart'
import { OrderSummarySidebar } from '@/components/shop/OrderSummarySidebar'

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  billingAddress: boolean
  paymentMethod: 'credit-card' | 'bank-transfer' | 'paypal'
}

const initialFormData: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Vietnam',
  billingAddress: false,
  paymentMethod: 'credit-card',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { cart, clearCart } = useCart()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})

  // Redirect if cart is empty
  useEffect(() => {
    setLoading(false)
    if (cart.length === 0) {
      router.push('/cart')
    }
  }, [cart, router])

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = true as any
    if (!formData.lastName.trim()) newErrors.lastName = true as any
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = true as any
    if (!formData.phone.trim()) newErrors.phone = true as any
    if (!formData.street.trim()) newErrors.street = true as any
    if (!formData.city.trim()) newErrors.city = true as any
    if (!formData.state.trim()) newErrors.state = true as any
    if (!formData.zipCode.trim()) newErrors.zipCode = true as any

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        type: 'error',
      })
      return
    }

    setSubmitting(true)

    try {
      // Create order
      const orderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
          country: formData.country,
        },
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        payment_method: formData.paymentMethod,
        notes: formData.billingAddress ? 'Same as shipping address' : '',
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const { id: orderId } = await response.json()

      // Clear cart
      clearCart()

      // Redirect to confirmation
      router.push(`/order-confirmation?orderId=${orderId}`)
    } catch (err: any) {
      console.error('Checkout error:', err)
      toast({
        title: 'Checkout Error',
        description: err.message || 'Failed to complete checkout. Please try again.',
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 500 ? 0 : 45
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      Shipping Address
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className={errors.street ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        className={errors.city ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                        className={errors.state ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                        className={errors.zipCode ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="Vietnam">Vietnam</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { value: 'credit-card', label: 'Credit Card', icon: '💳' },
                      { value: 'bank-transfer', label: 'Bank Transfer', icon: '🏦' },
                      { value: 'paypal', label: 'PayPal', icon: '🔵' },
                    ].map(method => (
                      <label key={method.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors" style={{
                        borderColor: formData.paymentMethod === method.value ? 'var(--primary)' : undefined,
                        backgroundColor: formData.paymentMethod === method.value ? 'var(--muted)' : undefined,
                      }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="text-xl">{method.icon}</span>
                        <span className="font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Purchase'
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="h-fit rounded-lg border bg-muted/30 p-6 sticky top-18">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <OrderSummarySidebar 
              items={cart} 
            />

            <Link href="/cart" className="text-sm text-primary hover:underline block mb-4">
              ← Back to Cart
            </Link>

            <div className="space-y-2 pt-4 border-t text-xs text-muted-foreground">
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
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
