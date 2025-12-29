import type { Metadata } from "next"
import { sql } from "@/lib/db"
import { ContactsTable } from "@/components/ContactsTable"
import { getContacts } from "@/lib/services/contacts"

export const metadata: Metadata = {
  title: "Contacts | Admin",
  description: "Manage contact inquiries",
}

export const dynamic = "force-dynamic"

export default async function AdminContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Contact Inquiries</h1>
        <p className="text-neutral-600 mt-1">Manage customer inquiries and messages</p>
      </div>

      <ContactsTable contacts={contacts} />
    </div>
  )
}
