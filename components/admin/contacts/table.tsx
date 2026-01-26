"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Trash2 } from "lucide-react"
import type { Contact } from "@/lib/types/contact"
import { useContactActions } from "@/hooks/admin"
import { useContactsData } from "@/hooks/admin/useContactsData"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [updating, setUpdating] = useState<number | null>(null)

  const { data, total, isLoading: dataLoading } = useContactsData({
    page,
    limit,
    search,
    status,
  })
  const { handleDelete: hookDelete, handleStatusChange: hookStatusChange, isLoading: actionLoading } = useContactActions()

  // Use API data if available, otherwise use initial data
  const displayData = data.length > 0 ? data : initialData
  const displayTotal = data.length > 0 ? total : initialTotal

  const handleStatusChange = async (contactId: number, newStatus: string) => {
    setUpdating(contactId)

    try {
      await hookStatusChange(contactId, newStatus)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (contactId: number) => {
    setUpdating(contactId)
    try {
      await hookDelete(contactId)
    } finally {
      setUpdating(null)
    }
  }

  const totalPages = Math.ceil(displayTotal / limit)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="divide-y divide-neutral-200">
          {dataLoading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : displayData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">No contact inquiries found</p>
            </div>
          ) : (
            displayData.map((contact) => (
              <div key={contact.id} className="p-6 hover:bg-neutral-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-neutral-900">{contact.name}</p>
                      <Select
                        value={contact.status}
                        onValueChange={(value) => handleStatusChange(contact.id, value)}
                        disabled={updating === contact.id}
                      >
                        <SelectTrigger
                          className={`h-7 px-3 text-xs font-medium rounded-full border-0 ${statusColors[contact.status]}`}
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
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
                    disabled={updating === contact.id || actionLoading}
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
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, displayTotal)} of {displayTotal} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || dataLoading}
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
              disabled={page === totalPages || dataLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


