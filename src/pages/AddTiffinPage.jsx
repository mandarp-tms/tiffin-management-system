import { useState, useRef, useEffect } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'
import { addTiffin, markNoTiffin } from '../services/tiffinService'
import { calculateAmount } from '../utils/calculateAmount'
import { TIFFIN_TYPES, CHAPATI_OPTIONS, ROLES } from '../utils/constants'
import { users } from '../mock/users'

const today = new Date().toISOString().split('T')[0]

const AddTiffinPage = () => {
    const { currentUser, isRole } = useAuth()
    const toast = useRef(null)

    const [selectedUser, setSelectedUser] = useState(null)
    const [date, setDate] = useState(today)
    const [type, setType] = useState('full')
    const [chapatiCount, setChapatiCount] = useState(3)
    const [note, setNote] = useState('')
    const [amount, setAmount] = useState(80)

    // Center can pick any user, regular user is fixed to themselves
    const userOptions = users
        .filter(u => u.role === ROLES.USER)
        .map(u => ({ label: u.name, value: u.id }))

    useEffect(() => {
        if (isRole(ROLES.CENTER)) {
            setSelectedUser(userOptions[0]?.value)
        }
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
        addTiffin({ userId: resolvedUserId, userName: resolvedUserName, date, type, chapatiCount, amount, note })
        toast.current.show({ severity: 'success', summary: 'Entry submitted', detail: 'Awaiting tiffin center approval', life: 3000 })
        setNote('')
    }

    const handleNoTiffin = () => {
        if (!resolvedUserId) {
            toast.current.show({ severity: 'warn', summary: 'Select a user', life: 2500 })
            return
        }
        markNoTiffin(resolvedUserId, resolvedUserName, date)
        toast.current.show({ severity: 'info', summary: 'Marked no tiffin', detail: `${resolvedUserName} — ${date}`, life: 3000 })
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
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    fontWeight: 600, fontSize: '14px',
                }}>
                    Add tiffin entry
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* User selector — center only */}
                    {isRole(ROLES.CENTER) && (
                        <div className='p-fluid'>
                            <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>User</label>
                            <Dropdown
                                value={selectedUser}
                                options={userOptions}
                                onChange={e => setSelectedUser(e.value)}
                                placeholder='Select user'
                            />
                        </div>
                    )}

                    {/* Date */}
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>Date</label>
                        <InputText
                            type='date'
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    {/* Tiffin type */}
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>Tiffin type</label>
                        <Dropdown
                            value={type}
                            options={TIFFIN_TYPES}
                            onChange={e => setType(e.value)}
                        />
                    </div>

                    {/* Chapati count — hidden for dal rice */}
                    {type !== 'dalrice' && chapatiOptions.length > 0 && (
                        <div className='p-fluid'>
                            <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>Chapati count</label>
                            <Dropdown
                                value={chapatiCount}
                                options={chapatiOptions}
                                onChange={e => setChapatiCount(e.value)}
                            />
                        </div>
                    )}

                    {/* Note */}
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>Note (optional)</label>
                        <InputText
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder='e.g. extra spicy, no onion'
                        />
                    </div>

                    {/* Amount preview */}
                    <div style={{
                        background: 'var(--surface-ground)',
                        borderRadius: '8px',
                        padding: '1rem',
                    }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                            Estimated amount
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F6E56' }}>
                            ₹{amount}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                            Subject to approval
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
                            label='Submit'
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