import clsx from 'clsx'
import styles from './AppButton.module.css'

const AppButton = ({
    label, icon, iconPosition = 'left',
    variant = 'primary', size = 'md',
    fullWidth = false, loading = false, disabled = false,
    onClick, style = {}, title,
}) => {
    const isDisabled = disabled || loading
    const iconSize = { sm: '12px', md: '14px', lg: '16px' }[size]

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            title={title}
            className={clsx(
                styles.btn,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
            )}
            style={style}
        >
            {loading && (
                <span
                    className={styles.spinner}
                    style={{ width: iconSize, height: iconSize }}
                />
            )}
            {!loading && icon && iconPosition === 'left' && <span style={{ fontSize: iconSize, display: 'flex' }}>{icon}</span>}
            {label && <span>{label}</span>}
            {!loading && icon && iconPosition === 'right' && <span style={{ fontSize: iconSize, display: 'flex' }}>{icon}</span>}
        </button>
    )
}

export default AppButton