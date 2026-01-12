import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCategogies() {
  const { data, error, isLoading } = useSWR("/api/categories", fetcher)
  console.log("000000000000", data)
  return { values: data?.data.map((elm: any)=> ({id: elm.id, name: elm.name})) ?? [], isLoading, error }
}
