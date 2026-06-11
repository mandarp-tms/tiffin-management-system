import { useState, useRef, useEffect } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'
import { addTiffin, markNoTiffin } from '../services/tiffinService'
import { calculateAmount } from '../utils/calculateAmount'
import { TIFFIN_TYPES, CHAPATI_OPTIONS, SHIFTS, ROLES } from '../utils/constants'
import { users } from '../mock/users'

// Allowed dates — today and tomorrow only (for users)
const getDateOptions = () => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const fmt = (d) => d.toISOString().split('T')[0]

    const label = (d, offset) => {
        const day = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
        return offset === 0 ? `Today — ${day}` : `Tomorrow — ${day}`
    }

    return [
        { label: label(today, 0), value: fmt(today) },
        { label: label(tomorrow, 1), value: fmt(tomorrow) },
    ]
}

const AddTiffinPage = () => {
    const { currentUser, isRole } = useAuth()
    const toast = useRef(null)

    const dateOptions = getDateOptions()
    const userOptions = users
        .filter(u => u.role === ROLES.USER)
        .map(u => ({ label: u.name, value: u.id }))

    const [selectedUser, setSelectedUser] = useState(null)
    const [date, setDate] = useState(dateOptions[0].value)
    const [shift, setShift] = useState('morning')
    const [type, setType] = useState('full')
    const [chapatiCount, setChapatiCount] = useState(3)
    const [note, setNote] = useState('')
    const [amount, setAmount] = useState(80)

    useEffect(() => {
        if (isRole(ROLES.CENTER)) setSelectedUser(userOptions[0]?.value)
    }, [])

    useEffect(() => {
        const chapOptions = CHAPATI_OPTIONS[type]
        const defaultChap = chapOptions?.[0]?.value ?? 0
        setChapatiCount(defaultChap)
        setAmount(calculateAmount(type, defaultChap))
    }, [type])

    useEffect(() => {
        setAmount(calculateAmount(type, chapatiCount))
    }, [chapatiCount])

    const resolvedUserId = isRole(ROLES.USER) ? currentUser.id : selectedUser
    const resolvedUserName = isRole(ROLES.USER) ? currentUser.name
        : users.find(u => u.id === selectedUser)?.name || ''

    const handleSubmit = () => {
        if (!resolvedUserId) {
            toast.current.show({ severity: 'warn', summary: 'Select a user', life: 2500 })
            return
        }
        addTiffin({
            userId: resolvedUserId,
            userName: resolvedUserName,
            date,
            shift,
            type,
            chapatiCount,
            amount,
            note,
            addedBy: isRole(ROLES.CENTER) ? 'center' : 'user',
        })
        toast.current.show({
            severity: 'success',
            summary: isRole(ROLES.CENTER) ? 'Entry added & approved' : 'Entry submitted',
            detail: isRole(ROLES.CENTER) ? `Added for ${resolvedUserName}` : 'Awaiting tiffin center approval',
            life: 3000,
        })
        setNote('')
    }

    const handleNoTiffin = () => {
        if (!resolvedUserId) {
            toast.current.show({ severity: 'warn', summary: 'Select a user', life: 2500 })
            return
        }
        markNoTiffin(resolvedUserId, resolvedUserName, date)
        toast.current.show({
            severity: 'info',
            summary: 'Marked no tiffin',
            detail: `${resolvedUserName} — ${date}`,
            life: 3000,
        })
    }

    const chapatiOptions = CHAPATI_OPTIONS[type]

    return (
        <div style={{ maxWidth: '480px' }}>
            <Toast ref={toast} />

            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Add tiffin entry</span>
                    {isRole(ROLES.CENTER) && (
                        <span style={{
                            background: '#E1F5EE', color: '#085041',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 500,
                        }}>
                            Auto-approved
                        </span>
                    )}
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* User selector — center only */}
                    {isRole(ROLES.CENTER) && (
                        <div className='p-fluid'>
                            <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                                User
                            </label>
                            <Dropdown
                                value={selectedUser}
                                options={userOptions}
                                onChange={e => setSelectedUser(e.value)}
                                placeholder='Select user'
                            />
                        </div>
                    )}

                    {/* Date — dropdown for users (today/tomorrow only), free for center */}
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Date
                        </label>
                        {isRole(ROLES.USER)
                            ? (
                                <Dropdown
                                    value={date}
                                    options={dateOptions}
                                    onChange={e => setDate(e.value)}
                                />
                            ) : (
                                <input
                                    type='date'
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            )
                        }
                    </div>

                    {/* Shift */}
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Shift
                        </label>
                        <Dropdown
                            value={shift}
                            options={SHIFTS}
                            onChange={e => setShift(e.value)}
                        />
                    </div>

                    {/* Tiffin type */}
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Tiffin type
                        </label>
                        <Dropdown
                            value={type}
                            options={TIFFIN_TYPES}
                            onChange={e => setType(e.value)}
                        />
                    </div>

                    {/* Chapati count */}
                    {type !== 'dalrice' && chapatiOptions.length > 0 && (
                        <div className='p-fluid'>
                            <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                                Chapati count
                            </label>
                            <Dropdown
                                value={chapatiCount}
                                options={chapatiOptions}
                                onChange={e => setChapatiCount(e.value)}
                            />
                        </div>
                    )}

                    {/* Note */}
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Note (optional)
                        </label>
                        <input
                            type='text'
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder='e.g. extra spicy, no onion'
                            style={{
                                width: '100%', height: '42px',
                                padding: '0 0.75rem',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                background: 'var(--surface-card)',
                                color: 'var(--text-color)',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Amount preview */}
                    <div style={{
                        background: 'var(--surface-ground)',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                                Estimated amount
                            </div>
                            <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F6E56' }}>
                                ₹{amount}
                            </div>
                            {!isRole(ROLES.CENTER) && (
                                <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                                    Subject to approval
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', textAlign: 'right' }}>
                            <div>{SHIFTS.find(s => s.value === shift)?.label}</div>
                            <div style={{ marginTop: '4px', fontWeight: 500 }}>
                                {date === dateOptions[0].value ? 'Today' : 'Tomorrow'}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button
                            label='No tiffin'
                            icon='pi pi-times'
                            severity='secondary'
                            outlined
                            style={{ flex: 1 }}
                            onClick={handleNoTiffin}
                        />
                        <Button
                            label={isRole(ROLES.CENTER) ? 'Add & approve' : 'Submit'}
                            icon='pi pi-check'
                            style={{ flex: 2 }}
                            onClick={handleSubmit}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AddTiffinPage