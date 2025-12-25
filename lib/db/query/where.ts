export function buildWhere(
  filter: Record<string, any>,
  opts: { alias?: string; fieldMap?: Record<string, string> } = {}
) {
  const conditions: string[] = []
  const values: any[] = []

  const prefix = opts.alias ? `${opts.alias}.` : ""

  if (filter.name) {
    values.push(`%${filter.name}%`)
    const column = opts.fieldMap?.name ?? `${prefix}name`
    conditions.push(`${column} ILIKE $${values.length}`)
  }

  if (filter.categoryId) {
    values.push(filter.categoryId)
    const column = opts.fieldMap?.categoryId ?? `${prefix}category_id`
    conditions.push(`${column} = $${values.length}`)
  }

  if (filter.isAvailable !== undefined) {
    values.push(filter.isAvailable)
    const column = opts.fieldMap?.isAvailable ?? `${prefix}is_available`
    conditions.push(`${column} = $${values.length}`)
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  }
}
