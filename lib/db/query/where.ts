import { sql } from "@/lib/db"

export function buildWhere(
  filter: Record<string, any>,
  opts: { alias?: string } = {}
) {
  const conditions: any[] = []
  const prefix = opts.alias ? `${opts.alias}.` : ""

  if (typeof filter.name === "string") {
    const v = filter.name.trim()
    if (v !== "") {
      conditions.push(
        sql`${sql.unsafe(prefix + "name")} ILIKE ${"%" + v + "%"}`
      )
    }
  }
   if (filter.room_type != null && filter.room_type !== "all") {
    conditions.push(
      sql`${sql.unsafe(prefix + "room_type")} = ${filter.room_type}`
    )
  }

  if (filter.categoryId != null) {
    conditions.push(
      sql`${sql.unsafe(prefix + "category_id")} = ${filter.categoryId}`
    )
  }

  if (typeof filter.isAvailable === "boolean") {
    conditions.push(
      sql`${sql.unsafe(prefix + "is_available")} = ${filter.isAvailable}`
    )
  }

  if (typeof filter.roomType === "string") {
    const v = filter.roomType.trim()
    if (v !== "") {
      conditions.push(
        sql`${sql.unsafe(prefix + "room_type")} = ${v}`
      )
    }
  }

  if (typeof filter.title === "string") {
    const v = filter.title.trim()
    if (v !== "") {
      conditions.push(
        sql`${sql.unsafe(prefix + "title")} ILIKE ${"%" + v + "%"}`
      )
    }
  }

  if (filter.status != null && filter.status !== "all") {
    conditions.push(
      sql`${sql.unsafe(prefix + "status")} = ${filter.status}`
    )
  }

  if (typeof filter.order_number === "string") {
    const v = filter.order_number.trim()
    if (v !== "") {
      conditions.push(
        sql`${sql.unsafe(prefix + "order_number")} ILIKE ${"%" + v + "%"}`
      )
    }
  }

  if (typeof filter.customer_name === "string") {
    const v = filter.customer_name.trim()
    if (v !== "") {
      conditions.push(
        sql`${sql.unsafe(prefix + "customer_name")} ILIKE ${"%" + v + "%"}`
      )
    }
  }

  if (typeof filter.customer_email === "string") {
    const v = filter.customer_email.trim()
    if (v !== "") {
      conditions.push(
        sql`${sql.unsafe(prefix + "customer_email")} ILIKE ${"%" + v + "%"}`
      )
    }
  }

  if (conditions.length === 0) {
    return sql``
  }

  // 🔥 Thay sql.join bằng reduce
  return sql`
    WHERE ${conditions.reduce(
      (acc, cur) => (acc ? sql`${acc} AND ${cur}` : cur),
      null as any
    )}
  `
}
