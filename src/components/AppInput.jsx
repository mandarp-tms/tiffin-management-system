import { useRef } from 'react'
import clsx from 'clsx'
import styles from './AppInput.module.css'

const AppInput = ({
    value, onChange, type = 'text',
    placeholder = '', label,
    disabled = false, fullWidth = true, style = {},
    error, icon, ...rest
}) => {
    const ref = useRef(null)

    const handleChange = (e) => { onChange?.({ value: e.target.value }) }

    return (
        <div
            className={clsx(styles.wrapper, fullWidth && styles.fullWidth)}
            style={style}
        >
            {label && <label className={styles.label}>{label}</label>}

            <div
                className={clsx(
                    styles.trigger,
                    disabled && styles.disabled,
                    error && styles.error,
                )}
            >
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    ref={ref}
                    type={type}
                    value={value ?? ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={styles.input}
                    {...rest}
                />
            </div>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    )
}

export default AppInput