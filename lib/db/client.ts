import { neon } from "@neondatabase/serverless"

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED

let sql: any

if (!databaseUrl) {
  console.error(
    "DATABASE_URL is missing. Please set DATABASE_URL in .env.local or your deployment environment.",
  )

  const dummy: any = new Proxy(
    () => {
      throw new Error(
        "Missing DATABASE_URL or POSTGRES_URL. Database access is unavailable.",
      )
    },
    {
      get: () => dummy,
      apply: () => {
        throw new Error(
          "Missing DATABASE_URL or POSTGRES_URL. Database access is unavailable.",
        )
      },
    },
  )

  sql = dummy
} else {
  sql = neon(databaseUrl)
}

export { sql }
