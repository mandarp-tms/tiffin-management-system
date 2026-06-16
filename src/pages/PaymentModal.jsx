import { useState, useRef } from 'react'
import { FaTimes } from 'react-icons/fa'
import { Toast } from 'primereact/toast'
import AppButton from '../components/AppButton'
import AppDropdown from '../components/AppDropdown'
import StatusBadge from '../components/StatusBadge'
import { recordPayment, getPayment, calculateTotalDue } from '../services/paymentService'
import { useAuth } from '../context/AuthContext'
import styles from './PaymentModal.module.css'

const PAYMENT_METHODS = [
    { label: '💵 Cash', value: 'cash' },
    { label: '📱 UPI', value: 'upi' },
    { label: '🏦 Bank Transfer', value: 'bank' },
    { label: '💳 Card', value: 'card' },
]

const CURRENT_MONTH = 6
const CURRENT_YEAR = 2025

const PaymentModal = ({ customer, centerId, onClose, onSuccess }) => {
    const { currentUser } = useAuth()
    const toast = useRef(null)
    const totalDue = calculateTotalDue(customer.id, centerId, CURRENT_MONTH, CURRENT_YEAR)
    const existing = getPayment(customer.id, centerId, CURRENT_MONTH, CURRENT_YEAR)
    const alreadyPaid = existing?.amountPaid || 0
    const balanceDue = Math.max(0, totalDue - alreadyPaid)

    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('cash')
    const [reference, setReference] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRecord = () => {
        const amt = parseFloat(amount)
        if (!amt || amt <= 0) {
            toast.current.show({ severity: 'warn', summary: 'Enter valid amount', life: 2000 })
            return
        }
        if (amt > balanceDue) {
            toast.current.show({ severity: 'warn', summary: `Amount exceeds balance due ₹${balanceDue}`, life: 2500 })
            return
        }
        setLoading(true)
        const result = recordPayment({
            userId: customer.id,
            userName: customer.name,
            centerId,
            month: CURRENT_MONTH,
            year: CURRENT_YEAR,
            amount: amt,
            method,
            reference,
            note,
            recordedBy: currentUser?.name,
        })
        setLoading(false)
        toast.current.show({ severity: 'success', summary: 'Payment recorded', detail: `₹${amt} recorded for ${customer.name}`, life: 2000 })
        setTimeout(() => { onSuccess?.(result); onClose() }, 1200)
    }

    const paymentStatus = existing
        ? (existing.balanceDue <= 0 ? 'paid' : 'partial')
        : 'unpaid'

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <Toast ref={toast} />

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <div className={styles.title}>Record payment — {customer.name}</div>
                        <div className={styles.sub}>June 2025</div>
                    </div>
                    <div className={styles.closeBtn} onClick={onClose}>
                        <FaTimes size={15} color='var(--text-color-secondary)' />
                    </div>
                </div>

                {/* Summary cards */}
                <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Total due</div>
                        <div className={styles.summaryValue}>₹{totalDue}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Already paid</div>
                        <div className={`${styles.summaryValue} ${styles.green}`}>₹{alreadyPaid}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Balance due</div>
                        <div className={`${styles.summaryValue} ${balanceDue > 0 ? styles.red : styles.green}`}>
                            ₹{balanceDue}
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Status</div>
                        <div style={{ marginTop: '4px' }}>
                            <StatusBadge status={paymentStatus} />
                        </div>
                    </div>
                </div>

                {/* Already fully paid */}
                {balanceDue <= 0 && (
                    <div className={styles.paidBanner}>
                        ✅ This customer has fully paid for June 2025
                    </div>
                )}

                {/* Payment form */}
                {balanceDue > 0 && (
                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Amount (max ₹{balanceDue})</label>
                            <div className={styles.amountInput}>
                                <span className={styles.rupee}>₹</span>
                                <input
                                    type='number'
                                    className={styles.amountField}
                                    placeholder={`0 – ${balanceDue}`}
                                    value={amount}
                                    min={1}
                                    max={balanceDue}
                                    onChange={e => setAmount(e.target.value)}
                                />
                                <button
                                    className={styles.fullBtn}
                                    onClick={() => setAmount(String(balanceDue))}
                                >
                                    Full
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <AppDropdown
                                label='Payment method'
                                value={method}
                                options={PAYMENT_METHODS}
                                onChange={e => setMethod(e.value)}
                            />
                        </div>

                        {(method === 'upi' || method === 'bank') && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Reference / Transaction ID</label>
                                <input
                                    type='text'
                                    className={styles.textInput}
                                    placeholder='e.g. UPI123456789'
                                    value={reference}
                                    onChange={e => setReference(e.target.value)}
                                />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Note (optional)</label>
                            <input
                                type='text'
                                className={styles.textInput}
                                placeholder='e.g. Second installment'
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Transaction history */}
                {existing?.transactions?.length > 0 && (
                    <div className={styles.historySection}>
                        <div className={styles.historyTitle}>Payment history</div>
                        {existing.transactions.map((tx, i) => (
                            <div key={tx.id} className={styles.txRow}>
                                <div className={styles.txLeft}>
                                    <div className={styles.txAmount}>₹{tx.amount}</div>
                                    <div className={styles.txMeta}>
                                        {tx.method.toUpperCase()}
                                        {tx.reference ? ` · ${tx.reference}` : ''}
                                        {tx.note ? ` · ${tx.note}` : ''}
                                    </div>
                                </div>
                                <div className={styles.txRight}>
                                    <div className={styles.txDate}>
                                        {new Date(tx.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </div>
                                    <div className={styles.txBy}>by {tx.recordedBy}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <AppButton label='Cancel' variant='secondary' onClick={onClose} />
                    {balanceDue > 0 && (
                        <AppButton
                            label='Record payment'
                            variant='primary'
                            loading={loading}
                            onClick={handleRecord}
                        />
                    )}
                </div>

            </div>
        </div>
    )
}

export default PaymentModal