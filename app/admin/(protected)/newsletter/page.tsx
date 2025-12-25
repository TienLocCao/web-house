import type { Metadata } from "next"
import { getNewsletterSubscribers } from "@/lib/services/newsletter"
import NewsletterClient from "@/components/admin/newsletter/client"

export const metadata: Metadata = { title: "Newsletter | Admin", description: "Manage newsletter subscribers" }
export const dynamic = "force-dynamic"

export default async function AdminNewsletterPage() {
  const { items, total } = await getNewsletterSubscribers({ page: 1, limit: 10 })
  return <NewsletterClient initialData={items} initialTotal={total} />
}