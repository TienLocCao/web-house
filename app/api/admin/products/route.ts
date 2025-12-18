import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"
import { getProducts } from "@/lib/services/products";
export const runtime = "edge"

const ProductCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  original_price: z.number().positive().optional(),
  category_id: z.number().int().optional(),
  room_type: z.enum(["living_room", "dining_room", "bedroom", "kitchen", "bathroom", "office"]),
  image_url: z.string().url(),
  gallery: z.array(z.string().url()).optional(),
  stock: z.number().int().min(0),
  is_featured: z.boolean().optional(),
  dimensions: z.record(z.string(),z.string()).optional(),
  material: z.string().optional(),
  color: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 5);
    const sort = JSON.parse(searchParams.get("sort") ?? "[]");

    const result = await getProducts({ page, limit, sort });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = ProductCreateSchema.parse(body)

    // Check if slug exists
    const [existingProduct] = await sql`SELECT id FROM products WHERE slug = ${validatedData.slug}`

    if (existingProduct) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
    }

    // Insert product
    const [product] = await sql
      `
      INSERT INTO products 
        (name, slug, description, price, original_price, category_id, room_type, image_url, gallery, stock, is_featured, dimensions, material, color)
      VALUES (${validatedData.name}, ${validatedData.slug}, ${validatedData.description || null}, ${validatedData.price}, ${validatedData.original_price || null}, ${validatedData.category_id || null}, ${validatedData.room_type}, ${validatedData.image_url}, ${JSON.stringify(validatedData.gallery || [])}, ${validatedData.stock}, ${validatedData.is_featured || false}, ${JSON.stringify(validatedData.dimensions || {})}, ${validatedData.material || null}, ${validatedData.color || null})
      RETURNING *
    `
    

    return NextResponse.json({ message: "Product created successfully", product }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create product error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.issues }, { status: 400 })
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
