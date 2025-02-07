export function dictToQueryString(params: Record<string, any>): string {
    const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
    return new URLSearchParams(filteredParams).toString()
}
