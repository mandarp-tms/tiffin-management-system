import { useState } from 'react'
import clsx from 'clsx'
import styles from './AppDataTable.module.css'

const AppDataTable = ({
    columns = [], data = [],
    emptyMessage = 'No records found.',
    pageSize = 10, loading = false,
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
        <div className={styles.wrapper}>
            <div className={styles.scrollWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={clsx(styles.th, col.align === 'right' && styles.right, col.align === 'center' && styles.center)}
                                    style={{ width: col.width || 'auto' }}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={columns.length} className={styles.empty}>Loading...</td></tr>
                        )}
                        {!loading && paginated.length === 0 && (
                            <tr><td colSpan={columns.length} className={styles.empty}>{emptyMessage}</td></tr>
                        )}
                        {!loading && paginated.map((row, rIdx) => (
                            <tr key={row.id || rIdx} className={styles.tr}>
                                {columns.map((col, cIdx) => (
                                    <td
                                        key={cIdx}
                                        className={clsx(
                                            styles.td,
                                            col.align === 'right' && styles.right,
                                            col.align === 'center' && styles.center,
                                        )}
                                        style={{ whiteSpace: col.noWrap ? 'nowrap' : 'normal' }}
                                    >
                                        {col.body ? col.body(row, rIdx) : row[col.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.paginator}>
                    <span className={styles.paginatorInfo}>
                        Showing {Math.min((page - 1) * pageSize + 1, data.length)}–{Math.min(page * pageSize, data.length)} of {data.length}
                    </span>
                    <div className={styles.paginatorPages}>
                        <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                        {getPageNumbers().map((p, i) =>
                            p === '...'
                                ? <span key={i} className={styles.ellipsis}>…</span>
                                : <button
                                    key={i}
                                    className={clsx(styles.pageBtn, p === page && styles.active)}
                                    onClick={() => setPage(p)}
                                >{p}</button>
                        )}
                        <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppDataTable