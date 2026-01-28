'use client'

import Image from 'next/image'
import { CartItem } from '@/hooks/useCart'
import { calculateOrderTotal } from '@/lib/utils/cart'

interface OrderSummarySidebarProps {
  items: CartItem[]
  discountRate?: number
}

/**
 * Reusable OrderSummarySidebar Component
 * Displays order totals for checkout page
 */
export function OrderSummarySidebar({
  items,
  discountRate = 0,
}: OrderSummarySidebarProps) {
  const orderTotal = calculateOrderTotal(items, discountRate)

  return (
    <>
      <div className="space-y-4 mb-6 pb-6 border-b max-h-64 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="flex gap-3">
            <div className="h-16 w-16 flex-shrink-0 rounded bg-white overflow-hidden">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold line-clamp-2">{item.name}</p>
              <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
              <p className="font-bold text-primary mt-1">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6 pb-6 border-b">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${orderTotal.subtotal.toFixed(2)}</span>
        </div>

        {orderTotal.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount ({(discountRate * 100).toFixed(0)}%)</span>
            <span className="font-semibold">-${orderTotal.discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-semibold">
            {orderTotal.shipping === 0 ? 'FREE' : `$${orderTotal.shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated Tax (10%)</span>
          <span className="font-semibold">${orderTotal.tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-baseline">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">${orderTotal.total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {orderTotal.shipping === 0 ? '✓ Free shipping applied!' : `Free shipping on orders over $500`}
        </p>
      </div>
    </>
  )
}
