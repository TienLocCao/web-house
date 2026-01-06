"use client"

import React from "react"
import useAdminSessionRefresh from "@/hooks/useAdminSessionRefresh"

export default function SessionRefresher() {
  useAdminSessionRefresh({
  intervalMs: 10 * 1000,      // refresh mỗi 10s
  idleTimeoutMs: 60 * 1000,   // idle 1 phút logout
})
  return <></>
}
