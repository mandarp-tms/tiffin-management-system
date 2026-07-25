import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBreadcrumbTrail } from '../routes'
import styles from './Breadcrumb.module.css'

// How many crumbs to show before collapsing the middle.
// e.g. maxVisible=4 → show first 1, collapse the rest into "...", show last 3.
const MAX_VISIBLE = 4
const TAIL_COUNT = 3   // how many trailing crumbs stay visible when collapsed

const Breadcrumb = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const trail = getBreadcrumbTrail(location.pathname)
    const [expanded, setExpanded] = useState(false)

    if (!trail.length) return null

    const shouldCollapse = trail.length > MAX_VISIBLE && !expanded

    // Split into head (always shown), hidden (collapsible middle), tail (always shown)
    const head = shouldCollapse ? trail.slice(0, 1) : []
    const hidden = shouldCollapse ? trail.slice(1, trail.length - TAIL_COUNT) : []
    const tail = shouldCollapse ? trail.slice(trail.length - TAIL_COUNT) : trail

    const renderCrumb = (item, i, isLast) => (
        <span key={item.path || `current-${i}`} className={styles.item}>
            {item.path ? (
                <span className={styles.link} onClick={() => navigate(item.path)}>
                    {item.label}
                </span>
            ) : (
                <span className={styles.current}>{item.label}</span>
            )}
            {!isLast && <span className={styles.sep}>›</span>}
        </span>
    )

    return (
        <div className={styles.breadcrumb}>
            {head.map((item, i) => renderCrumb(item, i, false))}

            {shouldCollapse && hidden.length > 0 && (
                <span className={styles.item}>
                    <span
                        className={styles.ellipsis}
                        onClick={() => setExpanded(true)}
                        title={hidden.map(h => h.label).join(' › ')}
                    >
                        …
                    </span>
                    <span className={styles.sep}>›</span>
                </span>
            )}

            {tail.map((item, i) => renderCrumb(item, i, i === tail.length - 1))}
        </div>
    )
}

export default Breadcrumb