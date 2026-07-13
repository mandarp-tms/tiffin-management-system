import clsx from 'clsx'
import styles from './AppRadio.module.css'

const AppRadio = ({ value, options = [], onChange, label, error, inline = true }) => (
    <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={clsx(styles.group, inline && styles.inline)}>
            {options.map(opt => (
                <label
                    key={opt.value}
                    className={clsx(styles.option, value === opt.value && styles.selected)}
                >
                    <input
                        type='radio'
                        name={label}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange?.({ value: opt.value })}
                        className={styles.radio}
                    />
                    {opt.label}
                </label>
            ))}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
    </div>
)

export default AppRadio