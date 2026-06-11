import { createContext, useContext, useState } from 'react'
import { users } from '../mock/users'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)

    const login = (username, password) => {
        const found = users.find(
            u => u.username === username.trim().toLowerCase() && u.password === password
        )
        if (found) {
            setCurrentUser(found)
            return { success: true, user: found }
        }
        return { success: false, message: 'Invalid username or password' }
    }

    const logout = () => setCurrentUser(null)

    const isRole = (role) => currentUser?.role === role

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isRole }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)