import { useState } from "react"
import type { ProductFormState } from "@/lib/types/product"

export const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  category: null,
  category_id: "",
  room_type: "",
  price: "",
  stock: "",
  is_featured: false,
  is_available: false,
  image_url: "",
  gallery: [],
  description: "",
}

export function useProductForm(
  initialForm?: Partial<ProductFormState>,
  onFieldChange?: (key: keyof ProductFormState) => void
) {
  const [form, setForm] = useState<ProductFormState>({
    ...EMPTY_FORM,
    ...initialForm,
  })

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    onFieldChange?.(key)
  }

  return {
    form,
    setForm,
    updateField,
  }
}