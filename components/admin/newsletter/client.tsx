"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import NewsletterCreateEditDialog from "@/components/admin/newsletter/createEditDialog"
import { NewsletterTable } from "@/components/admin/newsletter/table"

export default function NewsletterClient({ initialData, initialTotal }: any) {
  const { toast } = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState<any>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleDeleteConfirm(id: string) {
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE", credentials: "include" })
      const json = await res.json().catch(() => null)
      if (!res.ok) { toast({ title: json?.message || "Failed to delete", type: "error" }); return }
      toast({ title: "Subscriber deleted", type: "success" })
      setRefreshKey((s) => s + 1)
    } catch (err: any) {
      toast({ title: "Something went wrong", description: String(err), type: "error" })
    }
  }

  async function handleToggleActive(s: any) {
    try {
      const res = await fetch(`/api/admin/newsletter/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !s.is_active }) })
      const json = await res.json().catch(() => null)
      if (!res.ok) { toast({ title: json?.message || "Failed to update", type: "error" }); return }
      toast({ title: "Subscriber updated", type: "success" })
      setRefreshKey((r) => r + 1)
    } catch (err: any) {
      toast({ title: "Something went wrong", description: String(err), type: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Newsletter Subscribers</h1>
        <p className="text-neutral-600 mt-1">Manage newsletter subscribers</p>
      </div>

      <NewsletterTable initialData={initialData} initialTotal={initialTotal} refreshKey={refreshKey} onDelete={(s: any) => { setSelected(s); setDeleteOpen(true) }} onToggle={handleToggleActive} />

      <NewsletterCreateEditDialog open={deleteOpen} onOpenChange={setDeleteOpen} subscriber={selected} onDeleteConfirm={() => selected && handleDeleteConfirm(selected.id)} />
    </div>
  )
}