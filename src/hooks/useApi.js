import { useState, useEffect, useCallback } from 'react'

// Usage: const { data, loading, error, refetch } = useApi(() => getAllTiffins(filters), [filters])
export const useApi = (apiCall, deps = []) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await apiCall()
            setData(result)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, deps)

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch: fetchData }
}