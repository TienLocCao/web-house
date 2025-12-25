import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function NewsletterCreateEditDialog({ open, onOpenChange, subscriber, onDeleteConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; subscriber?: any | null; onDeleteConfirm?: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">Are you sure you want to delete <strong>{subscriber?.email}</strong>?</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onDeleteConfirm?.(); onOpenChange(false) }}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}