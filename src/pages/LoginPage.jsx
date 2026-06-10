import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'

const ROLE_HINTS = {
    admin: { email: 'admin@tiffin.com', password: 'admin123' },
    center: { email: 'center@tiffin.com', password: 'center123' },
    user: { email: 'rahul@tiffin.com', password: 'rahul123' },
}

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const toast = useRef(null)
    const [email, setEmail] = useState('admin@tiffin.com')
    const [password, setPassword] = useState('admin123')
    const [loading, setLoading] = useState(false)
    const [activeRole, setActiveRole] = useState('admin')

    const selectRole = (role) => {
        setActiveRole(role)
        setEmail(ROLE_HINTS[role].email)
        setPassword(ROLE_HINTS[role].password)
    }

    const handleLogin = () => {
        setLoading(true)
        const result = login(email, password)
        setLoading(false)
        if (result.success) {
            navigate('/dashboard')
        } else {
            toast.current.show({ severity: 'error', summary: 'Login failed', detail: result.message, life: 3000 })
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-ground)',
        }}>
            <Toast ref={toast} />
            <div style={{
                background: 'var(--surface-card)', borderRadius: '12px',
                padding: '2rem', width: '100%', maxWidth: '380px',
                border: '1px solid var(--surface-border)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '36px', marginBottom: '0.5rem' }}>🍱</div>
                    <h2 style={{ margin: 0, fontWeight: 700 }}>Tiffin Manager</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-color-secondary)', fontSize: '14px' }}>
                        Daily tiffin tracking & billing
                    </p>
                </div>

                {/* Role tabs */}
                <div style={{
                    display: 'flex', gap: '6px', marginBottom: '1.5rem',
                    background: 'var(--surface-ground)', borderRadius: '8px', padding: '4px'
                }}>
                    {['admin', 'center', 'user'].map(role => (
                        <button key={role} onClick={() => selectRole(role)} style={{
                            flex: 1, padding: '6px 4px', border: 'none', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '12px', fontWeight: activeRole === role ? 600 : 400,
                            background: activeRole === role ? 'var(--surface-card)' : 'transparent',
                            color: activeRole === role ? 'var(--primary-color)' : 'var(--text-color-secondary)',
                            boxShadow: activeRole === role ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.15s',
                        }}>
                            {role === 'admin' ? 'Super Admin' : role === 'center' ? 'Tiffin Center' : 'User'}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>Email</label>
                        <InputText value={email} onChange={e => setEmail(e.target.value)} placeholder='Enter email' />
                    </div>
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>Password</label>
                        <Password value={password} onChange={e => setPassword(e.target.value)}
                            placeholder='Enter password' feedback={false} toggleMask />
                    </div>
                    <Button label='Sign in' icon='pi pi-sign-in' loading={loading}
                        onClick={handleLogin} style={{ marginTop: '0.5rem' }} />
                </div>
            </div>
        </div>
    )
}

export default LoginPage