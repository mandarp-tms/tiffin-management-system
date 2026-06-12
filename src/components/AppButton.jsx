const VARIANTS = {
    primary: { background: 'var(--primary-color)', color: '#fff', border: 'var(--primary-color)' },
    secondary: { background: 'var(--surface-ground)', color: 'var(--text-color)', border: 'var(--surface-border)' },
    success: { background: '#1D9E75', color: '#fff', border: '#1D9E75' },
    danger: { background: 'transparent', color: '#A32D2D', border: '#A32D2D' },
    warning: { background: '#FAEEDA', color: '#633806', border: '#FAEEDA' },
    ghost: { background: 'transparent', color: 'var(--text-color-secondary)', border: 'transparent' },
}

const SIZES = {
    sm: { padding: '5px 12px', fontSize: '12px', height: '32px', iconSize: '12px' },
    md: { padding: '7px 16px', fontSize: '14px', height: '40px', iconSize: '14px' },
    lg: { padding: '10px 20px', fontSize: '15px', height: '46px', iconSize: '16px' },
}

const AppButton = ({
    label,
    icon,
    iconPosition = 'left',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    onClick,
    style = {},
    title,
}) => {
    const v = VARIANTS[variant] || VARIANTS.primary
    const s = SIZES[size] || SIZES.md

    const isDisabled = disabled || loading

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            title={title}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: s.height,
                padding: s.padding,
                fontSize: s.fontSize,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.6 : 1,
                border: `1px solid ${v.border}`,
                borderRadius: '8px',
                background: v.background,
                color: v.color,
                width: fullWidth ? '100%' : 'auto',
                transition: 'opacity 0.15s, filter 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                ...style,
            }}
            onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.filter = 'brightness(0.92)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
        >
            {loading && (
                <span style={{
                    width: s.iconSize, height: s.iconSize,
                    border: `2px solid currentColor`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                }} />
            )}
            {!loading && icon && iconPosition === 'left' && <span style={{ fontSize: s.iconSize, display: 'flex' }}>{icon}</span>}
            {label && <span>{label}</span>}
            {!loading && icon && iconPosition === 'right' && <span style={{ fontSize: s.iconSize, display: 'flex' }}>{icon}</span>}
        </button>
    )
}

export default AppButton