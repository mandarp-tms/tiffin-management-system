import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import styles from './AppDatePicker.module.css'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

const toISO = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const fromISO = (s) => {
    if (!s) return null
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
}

const formatDisplay = (d) => {
    if (!d) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = MONTH_LABELS[d.getMonth()].slice(0, 3)
    return `${day} ${month} ${d.getFullYear()}`
}

const buildMonthGrid = (viewDate) => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const startOffset = firstOfMonth.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    return cells
}

const isSameDay = (a, b) => a && b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()

const AppDatePicker = ({
    value, onChange,
    placeholder = 'Select date', label,
    disabled = false, fullWidth = true, style = {},
    minDate, maxDate,
}) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const selectedDate = fromISO(value)
    const [viewDate, setViewDate] = useState(selectedDate || new Date())

    useEffect(() => {
        if (selectedDate) setViewDate(selectedDate)
    }, [value])

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelectDay = (day) => {
        if (!day) return
        onChange?.({ value: toISO(day) })
        setOpen(false)
    }

    const goToMonth = (offset) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
    }

    const isDisabledDay = (day) => {
        if (!day) return true
        if (minDate && day < fromISO(minDate)) return true
        if (maxDate && day > fromISO(maxDate)) return true
        return false
    }

    const cells = buildMonthGrid(viewDate)
    const today = new Date()

    return (
        <div
            ref={ref}
            className={clsx(styles.wrapper, fullWidth && styles.fullWidth)}
            style={style}
        >
            {label && <label className={styles.label}>{label}</label>}

            <div
                onClick={() => !disabled && setOpen(o => !o)}
                className={clsx(styles.trigger, open && styles.open, disabled && styles.disabled)}
            >
                <span className={clsx(styles.triggerText, !selectedDate && styles.placeholder)}>
                    {selectedDate ? formatDisplay(selectedDate) : placeholder}
                </span>
                <span className={styles.icon}>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <rect x='3' y='5' width='18' height='16' rx='2' stroke='currentColor' strokeWidth='1.6' />
                        <path d='M3 9H21' stroke='currentColor' strokeWidth='1.6' />
                        <path d='M8 3V6' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
                        <path d='M16 3V6' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
                    </svg>
                </span>
            </div>

            {open && (
                <div className={styles.panel}>
                    <div className={styles.calHeader}>
                        <button type='button' className={styles.navBtn} onClick={() => goToMonth(-1)}>‹</button>
                        <span className={styles.calTitle}>
                            {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button type='button' className={styles.navBtn} onClick={() => goToMonth(1)}>›</button>
                    </div>

                    <div className={styles.dayLabels}>
                        {DAY_LABELS.map((d, i) => (
                            <span key={i} className={styles.dayLabel}>{d}</span>
                        ))}
                    </div>

                    <div className={styles.grid}>
                        {cells.map((day, i) => (
                            <button
                                type='button'
                                key={i}
                                disabled={isDisabledDay(day)}
                                onClick={() => handleSelectDay(day)}
                                className={clsx(
                                    styles.cell,
                                    !day && styles.emptyCell,
                                    day && isSameDay(day, selectedDate) && styles.selectedCell,
                                    day && isSameDay(day, today) && styles.todayCell,
                                    day && isDisabledDay(day) && styles.disabledCell,
                                )}
                            >
                                {day ? day.getDate() : ''}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppDatePicker