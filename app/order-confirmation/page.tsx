import { Suspense } from 'react'
import OrderConfirmationClient from './OrderConfirmationClient'

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading order confirmation...</div>}>
      <OrderConfirmationClient />
    </Suspense>
  )
}
