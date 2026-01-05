import type { Metadata } from "next"
import { getProducts } from "@/lib/services/products"
import ProductsClient from "@/components/admin/products/client"

export const metadata: Metadata = {
  title: "Products | Admin",
  description: "Manage products",
}

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const { items, total } = await getProducts({ page: 1, limit: 10 })

  return (
    <ProductsClient
      initialData={items}
      initialTotal={total}
    />
  )
}