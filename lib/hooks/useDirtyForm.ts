import { useCallback, useMemo, useRef } from "react"

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>()

  const stringify = (v: unknown): string => {
    if (v === null) return "null"

    const t = typeof v
    if (t === "string") return JSON.stringify(v)
    if (t === "number") return Number.isFinite(v) ? String(v) : '"__NaN__"'
    if (t === "boolean") return v ? "true" : "false"
    if (t === "undefined") return '"__undefined__"'
    if (t === "bigint") return JSON.stringify(v?.toString())
    if (t === "symbol" || t === "function") return '"__ignored__"'

    if (Array.isArray(v)) {
      return `[${v.map((x) => stringify(x)).join(",")}]`
    }

    if (v instanceof Date) {
      return JSON.stringify(v.toISOString())
    }

    if (t === "object") {
      const obj = v as Record<string, unknown>
      if (seen.has(obj)) return '"__cycle__"'
      seen.add(obj)

      const keys = Object.keys(obj)
        .filter((k) => obj[k] !== undefined)
        .sort()
      const entries = keys.map((k) => `${JSON.stringify(k)}:${stringify(obj[k])}`)
      return `{${entries.join(",")}}`
    }

    return JSON.stringify(String(v))
  }

  return stringify(value)
}

type Options<T> = {
  /** Convert form state to comparable serializable value */
  normalize?: (value: T) => unknown
}

export function useDirtyForm<T>(value: T, options?: Options<T>) {
  const normalize = options?.normalize
  const currentSignature = useMemo(() => {
    const normalized = normalize ? normalize(value) : value
    return stableStringify(normalized)
  }, [value, normalize])

  const initialSignatureRef = useRef<string | null>(null)

  const markClean = useCallback(
    (nextValue?: T) => {
      const normalized = normalize ? normalize(nextValue ?? value) : (nextValue ?? value)
      initialSignatureRef.current = stableStringify(normalized)
    },
    [value, normalize],
  )

  const isDirty =
    initialSignatureRef.current !== null &&
    initialSignatureRef.current !== currentSignature

  return { isDirty, markClean }
}

