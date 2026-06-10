const StatCard = ({ title, value, subtitle, icon, color = '#1D9E75' }) => {
    return (
        <div style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--surface-border)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-color-secondary)' }}>{title}</span>
                {icon && <i className={icon} style={{ fontSize: '18px', color }} />}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-color)' }}>{value}</div>
            {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)' }}>{subtitle}</div>}
        </div>
    )
}

export default StatCard