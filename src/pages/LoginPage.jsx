import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const toast = useRef(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = () => {
        if (!username || !password) {
            toast.current.show({
                severity: 'warn',
                summary: 'Required',
                detail: 'Please enter username and password',
                life: 2500,
            })
            return
        }
        setLoading(true)
        const result = login(username, password)
        setLoading(false)
        if (result.success) {
            navigate('/dashboard')
        } else {
            toast.current.show({
                severity: 'error',
                summary: 'Login failed',
                detail: result.message,
                life: 3000,
            })
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-ground)',
        }}>
            <Toast ref={toast} />
            <div style={{
                background: 'var(--surface-card)',
                borderRadius: '12px',
                padding: '2rem',
                width: '100%', maxWidth: '380px',
                border: '1px solid var(--surface-border)',
            }}>

                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '40px', marginBottom: '0.5rem' }}>🍱</div>
                    <h2 style={{ fontWeight: 700, fontSize: '20px' }}>Tiffin Manager</h2>
                    <p style={{ color: 'var(--text-color-secondary)', fontSize: '14px', marginTop: '4px' }}>
                        Daily tiffin tracking & billing
                    </p>
                </div>

                {/* Credential hint */}
                {/* <div style={{
                    background: 'var(--surface-ground)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1.25rem',
                    fontSize: '12px',
                    color: 'var(--text-color-secondary)',
                    lineHeight: '1.6',
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-color)' }}>
                        Test credentials
                    </div>
                    <div>superadmin / admin123</div>
                    <div>tiffincenter / center123</div>
                    <div>rahul / rahul123</div>
                    <div>priya / priya123</div>
                </div> */}

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Username
                        </label>
                        <InputText
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Enter your username'
                            autoComplete='username'
                        />
                    </div>

                    <div className='p-fluid'>
                        <label style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                            Password
                        </label>
                        <Password
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Enter your password'
                            feedback={false}
                            toggleMask
                        />
                    </div>

                    <Button
                        label='Sign in'
                        icon='pi pi-sign-in'
                        loading={loading}
                        onClick={handleLogin}
                        style={{ marginTop: '0.5rem' }}
                    />
                </div>

            </div>
        </div>
    )
}

export default LoginPage