import { useState } from 'react'
import AppButton from './AppButton'

const AppDataTable = ({
    columns = [],
    data = [],
    emptyMessage = 'No records found.',
    pageSize = 10,
    loading = false,
}) => {
    const [page, setPage] = useState(1)
    const totalPages = Math.ceil(data.length / pageSize)
    const paginated = data.slice((page - 1) * pageSize, page * pageSize)

    const getPageNumbers = () => {
        const pages = []
        const delta = 1
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                pages.push(i)
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...')
            }
        }
        return pages
    }

    return (
        <div style={{ width: '100%' }}>

            {/* Table */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                    tableLayout: 'auto',
                }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-ground)' }}>
                            {columns.map((col, i) => (
                                <th key={i} style={{
                                    padding: '10px 14px',
                                    textAlign: col.align || 'left',
                                    color: 'var(--text-color-secondary)',
                                    fontWeight: 500,
                                    fontSize: '12px',
                                    borderBottom: '1px solid var(--surface-border)',
                                    whiteSpace: 'nowrap',
                                    width: col.width || 'auto',
                                }}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-secondary)' }}>
                                    Loading...
                                </td>
                            </tr>
                        )}
                        {!loading && paginated.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-secondary)' }}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                        {!loading && paginated.map((row, rIdx) => (
                            <tr
                                key={row.id || rIdx}
                                style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.1s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-ground)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} style={{
                                        padding: '11px 14px',
                                        textAlign: col.align || 'left',
                                        whiteSpace: col.noWrap ? 'nowrap' : 'normal',
                                        color: 'var(--text-color)',
                                    }}>
                                        {col.body ? col.body(row) : row[col.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginator */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid var(--surface-border)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                }}>
                    {/* Info */}
                    <span style={{ fontSize: '12px', color: 'var(--text-color-secondary)' }}>
                        Showing {Math.min((page - 1) * pageSize + 1, data.length)}–{Math.min(page * pageSize, data.length)} of {data.length}
                    </span>

                    {/* Pages */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        {/* Prev */}
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            style={{
                                width: '34px', height: '34px',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                                background: 'var(--surface-card)',
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                opacity: page === 1 ? 0.4 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', color: 'var(--text-color)',
                            }}
                        >‹</button>

                        {getPageNumbers().map((p, i) => (
                            p === '...'
                                ? <span key={i} style={{ padding: '0 4px', color: 'var(--text-color-secondary)', fontSize: '13px' }}>…</span>
                                : <button
                                    key={i}
                                    onClick={() => setPage(p)}
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        border: `1px solid ${p === page ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                                        borderRadius: '8px',
                                        background: p === page ? 'var(--primary-color)' : 'var(--surface-card)',
                                        color: p === page ? '#fff' : 'var(--text-color)',
                                        fontWeight: p === page ? 600 : 400,
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >{p}</button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            style={{
                                width: '34px', height: '34px',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                                background: 'var(--surface-card)',
                                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                opacity: page === totalPages ? 0.4 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', color: 'var(--text-color)',
                            }}
                        >›</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppDataTable