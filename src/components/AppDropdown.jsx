import { useState, useRef, useEffect } from 'react'

const AppDropdown = ({
    value,
    options = [],
    onChange,
    placeholder = 'Select...',
    label,
    disabled = false,
    fullWidth = true,
    style = {},
}) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const selected = options.find(o => o.value === value)

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (opt) => {
        onChange?.({ value: opt.value })
        setOpen(false)
    }

    return (
        <div ref={ref} style={{ width: fullWidth ? '100%' : 'auto', position: 'relative', ...style }}>
            {label && (
                <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block', color: 'var(--text-color)' }}>
                    {label}
                </label>
            )}
            {/* Trigger */}
            <div
                onClick={() => !disabled && setOpen(o => !o)}
                style={{
                    height: '42px',
                    padding: '0 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    border: `1px solid ${open ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                    borderRadius: '8px',
                    background: disabled ? 'var(--surface-ground)' : 'var(--surface-card)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    color: selected ? 'var(--text-color)' : 'var(--text-color-secondary)',
                    boxShadow: open ? '0 0 0 2px var(--primary-200)' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    userSelect: 'none',
                }}
            >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected?.label || placeholder}
                </span>
                <span style={{
                    fontSize: '10px',
                    color: 'var(--text-color-secondary)',
                    transform: open ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                }}>▼</span>
            </div>

            {/* Dropdown panel */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    zIndex: 999,
                    overflow: 'hidden',
                    maxHeight: '220px',
                    overflowY: 'auto',
                }}>
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => handleSelect(opt)}
                            style={{
                                padding: '0.65rem 1rem',
                                fontSize: '14px',
                                cursor: 'pointer',
                                background: opt.value === value ? 'var(--primary-50)' : 'transparent',
                                color: opt.value === value ? 'var(--primary-color)' : 'var(--text-color)',
                                fontWeight: opt.value === value ? 600 : 400,
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = 'var(--surface-ground)' }}
                            onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = 'transparent' }}
                        >
                            {opt.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div style={{ padding: '0.75rem 1rem', fontSize: '13px', color: 'var(--text-color-secondary)' }}>
                            No options
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AppDropdown