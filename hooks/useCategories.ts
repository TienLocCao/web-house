import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCategories() {
  const { data, error, isLoading } = useSWR("/api/categories", fetcher)
  return { values: data?.data.map((elm: any)=> ({id: elm.id, name: elm.name})) ?? [], isLoading, error }
}
