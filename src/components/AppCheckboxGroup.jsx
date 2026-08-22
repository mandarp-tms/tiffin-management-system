import clsx from 'clsx'
import styles from './AppCheckboxGroup.module.css'

const AppCheckboxGroup = ({ value = {}, options = [], onChange, label, error, inline = true }) => {
    const handleToggle = (optValue) => {
        const nextValue = { ...value, [optValue]: !value[optValue] }
        onChange?.({ value: nextValue })
    }

    return (
        <div className={styles.wrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={clsx(styles.group, inline && styles.inline)}>
                {options.map(opt => (
                    <label
                        key={opt.value}
                        className={clsx(styles.option, value[opt.value] && styles.selected)}
                    >
                        <input
                            type='checkbox'
                            name={label}
                            value={opt.value}
                            checked={!!value[opt.value]}
                            onChange={() => handleToggle(opt.value)}
                            className={styles.checkbox}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    )
}

export default AppCheckboxGroup
