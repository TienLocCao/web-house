export type GalleryItemStatus = "uploading" | "done" | "error"

export interface GalleryItem {
  id: string
  url: string
  status?: GalleryItemStatus
}

