import React from 'react'
import clsx from 'clsx'
import styles from './TiffinMobileCard.module.css'
import StatusBadge from '../StatusBadge'

import { formatDate } from '../../utils/formatDate'

const TiffinMobileCard = ({ row, actions, hideCustomer = false }) => {
    return (
        <div className={clsx(styles.card, hideCustomer && styles.noCustomer)}>
            {!hideCustomer && (
                <div className={clsx(styles.cell, styles.customer)}>
                    {row.user?.name || row.userName || '—'}
                </div>
            )}
            <div className={clsx(styles.cell, styles.status)}>
                {hideCustomer && (
                    <div style={{ marginRight: '8px', transform: 'scale(1.05)', transformOrigin: 'right center' }}>
                        <StatusBadge status={row.shift || 'morning'} />
                    </div>
                )}
                <StatusBadge status={row.status} />
            </div>
            <div className={clsx(styles.cell, styles.date)}>
                <span style={{ fontSize: '12px', marginRight: '6px' }}>📅</span>
                {formatDate(row.date || row.entryDate)}
            </div>
            {!hideCustomer && (
                <div className={clsx(styles.cell, styles.shift)}>
                    <StatusBadge status={row.shift || 'morning'} />
                </div>
            )}
            <div className={clsx(styles.cell, styles.type)}>
                <StatusBadge status={row.tiffinType || row.type} />
            </div>
            <div className={clsx(styles.cell, styles.chapati)}>
                <span style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginRight: '6px' }}>Chapati:</span>
                {row.chapatiCount || '—'}
            </div>
            <div className={clsx(styles.cell, styles.amount)}>
                <span style={{ fontSize: '12px', color: 'var(--text-color-secondary)', fontWeight: 400 }}>Amount</span>
                <span style={{ color: row.status !== 'approved' ? 'var(--text-color-secondary)' : '#0F6E56' }}>
                    {row.amount ? `₹${row.amount}` : '—'}
                </span>
            </div>
            {actions && (
                <div className={clsx(styles.cell, styles.actions)}>
                    {actions}
                </div>
            )}
        </div>
    )
}

export default TiffinMobileCard
