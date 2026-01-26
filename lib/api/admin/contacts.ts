/**
 * Pure API layer for contacts
 */

import { secureFetchJSON } from "@/lib/utils"

export type ContactResponse = {
  success: boolean
  message?: string
  error?: string
}

export const deleteContact = async (id: number): Promise<ContactResponse> => {
  return secureFetchJSON<ContactResponse>(`/api/admin/contacts/${id}`, {
    method: "DELETE",
  })
}

export const updateContactStatus = async (id: number, status: string): Promise<ContactResponse> => {
  return secureFetchJSON<ContactResponse>(`/api/admin/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
