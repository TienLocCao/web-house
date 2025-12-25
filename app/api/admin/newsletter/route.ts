import { NextRequest, NextResponse } from "next/server"
import { getNewsletterSubscribers } from "@/lib/services/newsletter"
export const runtime = "edge"
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 10)
  const sort = JSON.parse(searchParams.get("sort") ?? "[]")
  const result = await getNewsletterSubscribers({ page, limit, sort })
  return NextResponse.json(result)
}