import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ProductDeleteDialogProps {
    open: boolean 
    onOpenChange: (open: boolean) => void
    onDeleteConfirm: () => void
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  onDeleteConfirm,
}: ProductDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* used externally via open state; keep trigger minimal */}
        <span />            
        </DialogTrigger>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { onDeleteConfirm(); onOpenChange(false); }}>
            Delete
            </Button>
        </DialogFooter> 
        </DialogContent>
    </Dialog>
    )
}
