import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useRoomTypes() {
  const { data, error, isLoading } = useSWR("/api/room-types", fetcher)
  return { values: data?.values ?? [], isLoading, error }
}
