'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react'
import { useCart, type CartItem } from '@/hooks/useCart'
import { useToast } from '@/hooks/useToast'

interface AddToCartProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    image_url: string
    material: string
    color: string
    stock: number
  }
  showQuantityControl?: boolean
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * Reusable AddToCart Component
 * Xử lý logic thêm sản phẩm vào giỏ
 */
export function AddToCart({
  product,
  showQuantityControl = true,
  variant = 'default',
  size = 'default',
  className = '',
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (quantity <= 0 || quantity > product.stock) {
      toast({
        title: 'Invalid Quantity',
        description: `Please select a quantity between 1 and ${product.stock}`,
        type: 'error',
      })
      return
    }

    setIsAdding(true)

    try {
      // Simulate API delay if needed
      await new Promise(resolve => setTimeout(resolve, 300))

      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        quantity,
        image_url: product.image_url,
        material: product.material,
        color: product.color,
      }

      addItem(cartItem)

      toast({
        title: 'Added to cart',
        description: `${quantity}x ${product.name} added successfully`,
        type: 'success',
      })

      // Reset quantity
      setQuantity(1)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        type: 'error',
      })
    } finally {
      setIsAdding(false)
    }
  }

  if (product.stock <= 0) {
    return (
      <Button
        disabled
        size={size}
        className={className}
      >
        Out of Stock
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {showQuantityControl && (
        <div>
          <label className="block text-sm font-medium mb-3">Quantity</label>
          <div className="flex items-center gap-3 bg-muted/50 w-fit rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="h-9 w-9 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
              className="h-9 w-9 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Button
        size={size}
        variant={variant}
        onClick={handleAddToCart}
        disabled={isAdding}
        className={className}
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart{quantity > 1 ? ` (${quantity})` : ''} - ${(product.price * quantity).toFixed(2)}
          </>
        )}
      </Button>
    </div>
  )
}
