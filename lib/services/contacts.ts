import { sql } from "@/lib/db"
import type { Contact } from "@/lib/types/contact"

export async function getContacts(): Promise<Contact[]> {
  const rows = await sql`
    SELECT
      id,
      name,
      email,
      phone,
      subject,
      message,
      status,
      created_at
    FROM contact_inquiries
    ORDER BY created_at DESC
  `

  return rows.map((r: any): Contact => ({
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    phone: r.phone ?? null,
    subject: r.subject ?? null,
    message: String(r.message),
    status: r.status,
    created_at: String(r.created_at),
  }))
}
