import type { Metadata } from "next"
import { ProductsTable } from "@/components/admin/products/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getProducts } from "@/lib/services/products"

export const metadata: Metadata = {
  title: "Products | Admin",
  description: "Manage products",
}

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const { items, total } = await getProducts({ page: 1, limit: 5 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-600 mt-1">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <ProductsTable
        initialData={items}
        initialTotal={total}
      />
    </div>
  )
}
