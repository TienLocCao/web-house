"use client"

import React from "react"
import useAdminSessionRefresh from "@/hooks/useAdminSessionRefresh"

export default function SessionRefresher() {
  useAdminSessionRefresh()
  return <></>
}
