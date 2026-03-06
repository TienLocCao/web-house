import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // gọi stored procedure cleanup
    await sql`CALL sp_cleanup_bulk_sessions();`;

    return NextResponse.json({
      success: true,
      message: "Cleanup sessions completed"
    });

  } catch (error) {
    console.error("Cleanup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed"
      },
      { status: 500 }
    );
  }
}