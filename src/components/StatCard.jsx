import styles from './StatCard.module.css'

const StatCard = ({ title, value, subtitle, icon, color = '#1D9E75' }) => (
    <div className={styles.card}>
        <div className={styles.header}>
            <span className={styles.label}>{title}</span>
            {icon && <i className={icon} style={{ fontSize: '18px', color }} />}
        </div>
        <div className={styles.value}>{value}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
)

export default StatCard