import { NextRequest, NextResponse } from "next/server"
import { getContacts } from "@/lib/services/contacts"
import { withAdminAuth } from "@/lib/admin-api"

export const runtime = "edge"

export const GET = (request: NextRequest) =>
  withAdminAuth(request, async (admin) => {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") ?? 1)
    const limit = Number(searchParams.get("limit") ?? 5)
    let sort: any[] = []
    try {
      sort = JSON.parse(searchParams.get("sort") ?? "[]")
    } catch {}

    // support filtering
    const search = searchParams.get("search") ?? undefined
    const status = searchParams.get("status") ?? undefined
    const filter: any = {}
    if (search) filter.search = search
    if (status) filter.status = status

    const result = await getContacts({ page, limit, sort, filter })
    return NextResponse.json(result)
  })


