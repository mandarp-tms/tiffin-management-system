export const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}

export const toInputDate = (dateStr) => {
    return new Date(dateStr).toISOString().split('T')[0]
}

export const getCurrentMonthRange = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    return { start, end }
}

export const isSameDay = (d1, d2) => {
    return new Date(d1).toDateString() === new Date(d2).toDateString()
}