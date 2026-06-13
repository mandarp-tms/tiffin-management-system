import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import styles from './AppDropdown.module.css'

const AppDropdown = ({
    value, options = [], onChange,
    placeholder = 'Select...', label,
    disabled = false, fullWidth = true, style = {},
}) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const selected = options.find(o => o.value === value)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (opt) => { onChange?.({ value: opt.value }); setOpen(false) }

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
                <span className={clsx(styles.triggerText, !selected && styles.placeholder)}>
                    {selected?.label || placeholder}
                </span>
                <span className={clsx(styles.chevron, open && styles.rotated)}>▼</span>
            </div>

            {open && (
                <div className={styles.panel}>
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => handleSelect(opt)}
                            className={clsx(styles.option, opt.value === value && styles.selected)}
                        >
                            {opt.label}
                        </div>
                    ))}
                    {options.length === 0 && <div className={styles.empty}>No options</div>}
                </div>
            )}
        </div>
    )
}

export default AppDropdown