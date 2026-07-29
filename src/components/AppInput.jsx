import { useRef, useState } from 'react'
import clsx from 'clsx'
import styles from './AppInput.module.css'

const AppInput = ({
    value, onChange, type = 'text',
    placeholder = '', label,
    disabled = false, fullWidth = true, style = {},
    error, icon, ...rest
}) => {
    const ref = useRef(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => { onChange?.({ value: e.target.value }) }
    
    const isPassword = type === 'password'
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

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
                    type={actualType}
                    value={value ?? ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={styles.input}
                    {...rest}
                />
                {isPassword && (
                    <button
                        type="button"
                        className={styles.eyeIcon}
                        onClick={() => setShowPassword(prev => !prev)}
                        tabIndex="-1"
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        <i className={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'} />
                    </button>
                )}
            </div>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    )
}

export default AppInput