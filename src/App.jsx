import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { PATHS } from './routes'

import ProtectedRoute from './layouts/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MyTiffinsPage from './pages/MyTiffinsPage'
import ApprovalsPage from './pages/ApprovalsPage'
import ReportsPage from './pages/ReportsPage'
import ModuleListPage from './pages/ModuleListPage'
import MyBillPage from './pages/MyBillPage'
import MyPaymentsPage from './pages/MyPaymentsPage'
import UsersPage from './pages/UsersPage'
import TiffinCentersPage from './pages/TiffinCentersPage'
import ModuleFormPage from './pages/ModuleFormPage'

import { useEffect, useRef } from 'react'
import { Toast } from 'primereact/toast'
import { messaging, onMessage } from './config/firebase'

const App = () => {
  const { currentUser } = useAuth()
  const toast = useRef(null)

  useEffect(() => {
    if (!messaging) return
    
    try {
      const unsubscribe = onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {}
        if (toast.current) {
          toast.current.show({
            severity: 'info',
            summary: title,
            detail: body,
            life: 5000
          })
        }
        
        // Dispatch a custom event so other components (like the notification bell) can update their unseen count
        window.dispatchEvent(new Event('tms_notification_received'))
      })

      return () => {
        if (unsubscribe) unsubscribe()
      }
    } catch (err) {
      console.error('Firebase foreground messaging error:', err)
    }
  }, [])

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <Routes>
      <Route
        path={PATHS.LOGIN}
        element={currentUser ? <Navigate to={PATHS.DASHBOARD} replace /> : <LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={PATHS.DASHBOARD}      element={<DashboardPage />} />
          <Route path={PATHS.MY_TIFFINS}     element={<MyTiffinsPage />} />
          <Route path={PATHS.APPROVALS}      element={<ApprovalsPage />} />
          <Route path={PATHS.REPORTS}        element={<ReportsPage />} />
          <Route path={PATHS.PRICING}        element={<ModuleListPage moduleId="pricing" />} />
          <Route path={PATHS.MY_BILL}        element={<MyBillPage />} />
          <Route path={PATHS.MY_PAYMENTS}    element={<MyPaymentsPage />} />
          <Route path={PATHS.USERS}          element={<UsersPage />} />
          <Route path={PATHS.TIFFIN_CENTERS} element={<TiffinCentersPage />} />

          {/* Dynamic module routes */}
          <Route path={PATHS.MODULE_ADD_PATTERN}  element={<ModuleFormPage mode='add' />} />
          <Route path={PATHS.MODULE_EDIT_PATTERN} element={<ModuleFormPage mode='edit' />} />
        </Route>
      </Route>

      <Route
        path='*'
        element={<Navigate to={currentUser ? PATHS.DASHBOARD : PATHS.LOGIN} replace />}
      />
    </Routes>
    </>
  )
}

export default App