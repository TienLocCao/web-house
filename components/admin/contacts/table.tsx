"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import type { Contact } from "@/lib/types/contact"

interface ContactsTableProps {
  initialData: Contact[]
  initialTotal: number
  search?: string
  status?: string
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-neutral-100 text-neutral-800",
}

export function ContactsTable({ initialData, initialTotal, search, status }: ContactsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<Contact[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(limit))
        if (search) params.set("search", search)
        if (status) params.set("status", status)

        const res = await fetch(`/api/admin/contacts?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch contacts")

        const json: { items: Contact[]; total: number } = await res.json()

        if (!ignore) {
          if (json.items.length === 0 && page > 1) {
            setPage((p) => Math.max(1, p - 1))
            return
          }
          setData(json.items)
          setTotal(json.total)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchData()
    return () => {
      ignore = true
    }
  }, [page, search, status, limit])

  // when filters change, reset to first page
  useEffect(() => {
    setPage(1)
  }, [search, status])

  const handleStatusChange = async (contactId: number, newStatus: string) => {
    setUpdating(contactId)

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({ title: "Status updated", type: "success" })
        // Refetch data
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(limit))
        if (search) params.set("search", search)
        if (status) params.set("status", status)

        const res = await fetch(`/api/admin/contacts?${params.toString()}`)
        if (res.ok) {
          const json: { items: Contact[]; total: number } = await res.json()
          setData(json.items)
        }
      } else {
        const json = await response.json().catch(() => null)
        toast({ title: json?.error || "Failed to update status", type: "error" })
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast({ title: "An error occurred", type: "error" })
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (contactId: number) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return

    setUpdating(contactId)

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, { method: "DELETE" })

      if (response.ok) {
        toast({ title: "Inquiry deleted", type: "success" })
        // Refetch data
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(limit))
        if (search) params.set("search", search)
        if (status) params.set("status", status)

        const res = await fetch(`/api/admin/contacts?${params.toString()}`)
        if (res.ok) {
          const json: { items: Contact[]; total: number } = await res.json()
          setData(json.items)
          setTotal(json.total)
          if (json.items.length === 0 && page > 1) {
            setPage((p) => Math.max(1, p - 1))
          }
        }
      } else {
        const json = await response.json().catch(() => null)
        toast({ title: json?.error || "Failed to delete inquiry", type: "error" })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({ title: "An error occurred", type: "error" })
    } finally {
      setUpdating(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="divide-y divide-neutral-200">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">No contact inquiries found</p>
            </div>
          ) : (
            data.map((contact) => (
              <div key={contact.id} className="p-6 hover:bg-neutral-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-neutral-900">{contact.name}</p>
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                        disabled={updating === contact.id}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[contact.status]}`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 mb-2 text-sm text-neutral-600">
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-neutral-900">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </a>
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-neutral-900">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </a>
                      )}
                    </div>

                    {contact.subject && <p className="font-medium text-neutral-900 mb-2">{contact.subject}</p>}

                    <p className="text-sm text-neutral-700 mb-2 whitespace-pre-wrap">{contact.message}</p>

                    <p className="text-xs text-neutral-500">{new Date(contact.created_at).toLocaleString()}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contact.id)}
                    disabled={updating === contact.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <div className="text-sm text-neutral-600">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


