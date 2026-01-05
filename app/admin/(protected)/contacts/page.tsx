import type { Metadata } from "next"
import { getContacts } from "@/lib/services/contacts"
import ContactsClient from "@/components/admin/contacts/client"

export const metadata: Metadata = {
  title: "Contacts | Admin",
  description: "Manage contact inquiries",
}

export const dynamic = "force-dynamic"

export default async function AdminContactsPage() {
  const { items, total } = await getContacts({ page: 1, limit: 10 })

  return (
    <ContactsClient
      initialData={items}
      initialTotal={total}
    />
  )
}
