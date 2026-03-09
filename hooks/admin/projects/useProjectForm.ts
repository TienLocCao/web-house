import { useState } from "react"
import type { ProjectFormState } from "@/lib/types/project"

export const EMPTY_FORM: ProjectFormState = {
  title: "",
  slug: "",
  client_name: "",
  location: "",
  description: "",
  image_url: "",
  gallery: [],
  room_type: "",
  status: "completed",
  completion_date: "",
  budget: "",
  featured: false,
}

export function useProjectForm(
  initialForm?: Partial<ProjectFormState>,
  onFieldChange?: (key: keyof ProjectFormState) => void
) {
  const [form, setForm] = useState<ProjectFormState>({
    ...EMPTY_FORM,
    ...initialForm,
  })

  function updateField<K extends keyof ProjectFormState>(
    key: K,
    value: ProjectFormState[K]
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