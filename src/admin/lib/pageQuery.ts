import { useSearchParams } from 'react-router-dom'

/** Read/write the `?q=` filter term in the URL (shared with global search). */
export function useQuery(): [string, (v: string) => void] {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const setQ = (v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set('q', v)
    else p.delete('q')
    setParams(p, { replace: true })
  }
  return [q, setQ]
}

/** True when `q` is empty or appears in any of the supplied fields. */
export function matchQuery(
  q: string,
  fields: Array<string | number | null | undefined>,
): boolean {
  const t = q.trim().toLowerCase()
  if (!t) return true
  return fields.some((f) => f != null && String(f).toLowerCase().includes(t))
}
