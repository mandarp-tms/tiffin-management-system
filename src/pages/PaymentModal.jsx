import { useState, useRef, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { Toast } from 'primereact/toast'
import AppButton from '../components/AppButton'
import AppDropdown from '../components/AppDropdown'
import StatusBadge from '../components/StatusBadge'
import { getPayment, recordPayment } from '../services/paymentService'
import { useAuth } from '../context/AuthContext'
import styles from './PaymentModal.module.css'

const PAYMENT_METHODS = [
    { label: '💵 Cash', value: 'cash' },
    { label: '📱 UPI', value: 'upi' },
    { label: '🏦 Bank Transfer', value: 'bank' },
    { label: '💳 Card', value: 'card' },
]

const now = new Date()
const CURRENT_MONTH = now.getMonth() + 1
const CURRENT_YEAR = now.getFullYear()
const MONTH_LABEL = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

const PaymentModal = ({ customer, centerId, onClose, onSuccess }) => {
    const { currentUser } = useAuth()
    const toast = useRef(null)

    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('cash')
    const [reference, setReference] = useState('')
    const [note, setNote] = useState('')

    // Load existing payment on open
    useEffect(() => {
        setLoading(true)
        getPayment(customer.id, centerId, CURRENT_MONTH, CURRENT_YEAR)
            .then(data => setPayment(data))
            .catch(err => console.error('Load payment error:', err))
            .finally(() => setLoading(false))
    }, [customer.id, centerId])

    const totalAmount = customer.total || 0
    const alreadyPaid = parseFloat(customer.amountPaid || payment?.amountPaid || 0)
    const balanceDue = customer.balanceDue || 0
    const payStatus = customer.payStatus || (alreadyPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial')

    const handleRecord = async () => {
        const amt = parseFloat(amount)
        if (!amt || amt <= 0) {
            toast.current.show({ severity: 'warn', summary: 'Enter valid amount', life: 2000 })
            return
        }
        if (amt > balanceDue) {
            toast.current.show({
                severity: 'warn',
                summary: `Amount exceeds balance due ₹${balanceDue}`,
                life: 2500,
            })
            return
        }
        setSubmitting(true)
        try {
            await recordPayment({
                userId: customer.id,
                centerId,
                month: CURRENT_MONTH,
                year: CURRENT_YEAR,
                amount: amt,
                method,
                reference,
                note,
            })
            toast.current.show({
                severity: 'success',
                summary: 'Payment recorded',
                detail: `₹${amt} recorded for ${customer.name}`,
                life: 2000,
            })
            setTimeout(() => { onSuccess?.(); onClose() }, 1200)
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Failed to record payment',
                detail: err?.message || 'Something went wrong',
                life: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <Toast ref={toast} />

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <div className={styles.title}>Record payment — {customer.name}</div>
                        <div className={styles.sub}>{MONTH_LABEL}</div>
                    </div>
                    <div className={styles.closeBtn} onClick={onClose}>
                        <FaTimes size={15} color='var(--text-color-secondary)' />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-secondary)', fontSize: '13px' }}>
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className={styles.summaryRow}>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Total amount</div>
                                <div className={styles.summaryValue}>₹{totalAmount}</div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Already paid</div>
                                <div className={`${styles.summaryValue} ${styles.green}`}>₹{alreadyPaid}</div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Due amount</div>
                                <div className={`${styles.summaryValue} ${balanceDue > 0 ? styles.red : styles.green}`}>
                                    ₹{balanceDue}
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Status</div>
                                <div style={{ marginTop: '4px' }}>
                                    <StatusBadge status={payStatus} />
                                </div>
                            </div>
                        </div>

                        {/* Already fully paid */}
                        {(balanceDue <= 0 && payStatus === 'paid') && (
                            <div className={styles.paidBanner}>
                                ✅ {customer.name} has fully paid for {MONTH_LABEL}
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
                                        <button className={styles.fullBtn} onClick={() => setAmount(String(balanceDue))}>
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
                        {payment?.transactions?.length > 0 && (
                            <div className={styles.historySection}>
                                <div className={styles.historyTitle}>Payment history</div>
                                {payment.transactions.map((tx, i) => (
                                    <div key={tx.id || i} className={styles.txRow}>
                                        <div className={styles.txLeft}>
                                            <span className={styles.txAmount}>₹{tx.amount}</span>
                                            <span className={styles.txMethod}>
                                                {tx.method?.toUpperCase()}
                                                {tx.reference ? ` · ${tx.reference}` : ''}
                                            </span>
                                            {tx.note && <span className={styles.txNote}>{tx.note}</span>}
                                        </div>
                                        <div className={styles.txRight}>
                                            <span className={styles.txDate}>
                                                {new Date(tx.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className={styles.txBy}>by {tx.recordedByName || tx.recordedBy}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <AppButton label='Cancel' variant='secondary' onClick={onClose} />
                    {!loading && balanceDue > 0 && (
                        <AppButton
                            label={submitting ? 'Recording...' : 'Record payment'}
                            variant='primary'
                            loading={submitting}
                            onClick={handleRecord}
                        />
                    )}
                </div>

            </div>
        </div>
    )
}

export default PaymentModal