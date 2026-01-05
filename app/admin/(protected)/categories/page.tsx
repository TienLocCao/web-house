import type { Metadata } from "next"
import { getCategories } from "@/lib/services/categories"
import CategoriesClient from "@/components/admin/categories/client"

export const metadata: Metadata = { title: "Categories | Admin", description: "Manage categories" }
export const dynamic = "force-dynamic"

export default async function AdminCategoriesPage() {
  const { items, total } = await getCategories({ page: 1, limit: 10 })
  return <CategoriesClient initialData={items} initialTotal={total} />
}