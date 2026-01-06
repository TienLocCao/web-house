import { NextRequest, NextResponse } from "next/server"
import { getNewsletterSubscribers } from "@/lib/services/newsletter"
import { withAdminAuth } from "@/lib/middleware"

export const runtime = "edge"

export const GET = (request: NextRequest) =>
  withAdminAuth(request, async (admin) => {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") ?? 1)
    const limit = Number(searchParams.get("limit") ?? 10)
    const sort = JSON.parse(searchParams.get("sort") ?? "[]")
    const result = await getNewsletterSubscribers({ page, limit, sort })
    return NextResponse.json(result)
  })