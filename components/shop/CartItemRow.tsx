'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CartItem } from '@/hooks/useCart'
import { formatVND } from '@/lib/utils'

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemove: () => void
}

/**
 * Reusable CartItemRow Component
 * Displays a single item in the cart with quantity controls
 */
export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const itemTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      {/* Product Image */}
      <div className="h-28 w-28 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
        <Image
          src={item.image_url || "/placeholder.svg"}
          alt={item.name}
          width={112}
          height={112}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <Link href={`/products/${item.slug}`}>
          <h3 className="font-semibold hover:text-primary transition-colors mb-1">
            {item.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">
          {item.material} • {item.color}
        </p>

        {/* Quantity Control */}
        <div className="flex items-center gap-2 bg-muted/50 w-fit rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="rounded p-1 hover:bg-background transition-colors"
            title="Decrease quantity"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold" aria-label={`Quantity: ${item.quantity}`}>
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="rounded p-1 hover:bg-background transition-colors"
            title="Increase quantity"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price and Actions */}
      <div className="flex flex-col items-end justify-between">
        <div className="text-right">
          <p className="text-lg font-bold text-primary">
            {formatVND(itemTotal)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatVND(Number(item.price))} each
          </p>
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded"
          title="Remove item"
          aria-label="Remove item from cart"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
