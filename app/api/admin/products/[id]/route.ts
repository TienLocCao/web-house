import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const runtime = "edge"

// DELETE /api/admin/products/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const productId = Number.parseInt(params.id)

    // Check if product exists
    const [product] = await sql`SELECT id FROM products WHERE id = ${productId}`

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    await sql`DELETE FROM products WHERE id = ${productId}`

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete product error:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

// PATCH /api/admin/products/[id]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const productId = Number.parseInt(params.id)
    const body = await request.json()

    // Update product
    await sql
      `
      UPDATE products
      SET 
        name = COALESCE(${body.name || null}, name),
        price = COALESCE(${body.price || null}, price),
        stock = COALESCE(${body.stock !== undefined ? body.stock : null}, stock),
        description = COALESCE(${body.description || null}, description),
        is_featured = COALESCE(${body.is_featured !== undefined ? body.is_featured : null}, is_featured),
        is_available = COALESCE(${body.is_available !== undefined ? body.is_available : null}, is_available)
      WHERE id = ${productId}
    `

    return NextResponse.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("[v0] Update product error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
