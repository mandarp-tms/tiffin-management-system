import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import styles from './LoginPage.module.css'

const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const toast = useRef(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = () => {
        if (!username || !password) {
            toast.current.show({ severity: 'warn', summary: 'Required', detail: 'Please enter username and password', life: 2500 })
            return
        }
        setLoading(true)
        const result = login(username, password)
        setLoading(false)
        if (result.success) {
            navigate('/dashboard')
        } else {
            toast.current.show({ severity: 'error', summary: 'Login failed', detail: result.message, life: 3000 })
        }
    }

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

    return (
        <div className={styles.page}>
            <Toast ref={toast} />
            <div className={styles.card}>

                <div className={styles.brand}>
                    <img src={logo} alt='Tiffin Manager' className={styles.brandLogo} />
                    <h2 className={styles.brandTitle}>Tiffin Manager</h2>
                    <p className={styles.brandSub}>Daily tiffin tracking & billing</p>
                </div>

                <div className={styles.form}>
                    <div className={`${styles.formGroup} p-fluid`}>
                        <label className={styles.label}>Username</label>
                        <InputText
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Enter your username'
                            autoComplete='username'
                        />
                    </div>
                    <div className={`${styles.formGroup} p-fluid`}>
                        <label className={styles.label}>Password</label>
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
                        className={styles.submitBtn}
                    />
                </div>

            </div>
        </div>
    )
}

export default LoginPage