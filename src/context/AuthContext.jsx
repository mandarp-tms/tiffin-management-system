import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../utils/apiClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('tms_token')
        const savedUser = localStorage.getItem('tms_user')
        if (token && savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser))
            } catch {
                localStorage.removeItem('tms_user')
                localStorage.removeItem('tms_token')
            }
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            // Call API directly here — no service wrapper confusion
            const body = await apiClient.post('/auth/login', { username, password })
            // body = { success: true, data: { token, user } }  ← from interceptor

            // console.log('login body:', body)

            const token = body?.data?.token
            const user = body?.data?.user

            if (!token || !user) {
                console.error('Missing token or user in response:', body)
                return { success: false, message: 'Unexpected response from server' }
            }

            localStorage.setItem('tms_token', token)
            localStorage.setItem('tms_user', JSON.stringify(user))
            setCurrentUser(user)
            return { success: true }

        } catch (err) {
            console.error('Login catch error:', err)
            return {
                success: false,
                message: err?.message || 'Login failed. Please try again.',
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('tms_token')
        localStorage.removeItem('tms_user')
        setCurrentUser(null)
    }

    const isRole = (role) => currentUser?.role === role

    if (loading) return null

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isRole, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)