import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import ProtectedRoute from './layouts/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AddTiffinPage from './pages/AddTiffinPage'
import ApprovalsPage from './pages/ApprovalsPage'
import ReportsPage from './pages/ReportsPage'
import PricingPage from './pages/PricingPage'
import MyBillPage from './pages/MyBillPage'
import UsersPage from './pages/UsersPage'
import TiffinCentersPage from './pages/TiffinCentersPage'
// import ModulePage from './pages/ModulePage'
import ModuleFormPage from './pages/ModuleFormPage'

const App = () => {
  const { currentUser } = useAuth()

  return (
    <Routes>
      <Route
        path='/login'
        element={currentUser ? <Navigate to='/dashboard' replace /> : <LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path='/dashboard' element={<DashboardPage />} />

          {/* Custom pages */}
          <Route path='/add-tiffin' element={<AddTiffinPage />} />
          <Route path='/approvals' element={<ApprovalsPage />} />
          <Route path='/reports' element={<ReportsPage />} />
          <Route path='/pricing' element={<PricingPage />} />
          <Route path='/my-bill' element={<MyBillPage />} />
          <Route path='/users' element={<UsersPage />} />
          <Route path='/tiffin-centers' element={<TiffinCentersPage />} />
          {/* Dynamic module routes (e.g. /module/users, /module/tiffin-centers) */}
          {/* <Route path='/module/:moduleId' element={<ModulePage />} /> */}
          <Route path='/module/:moduleId/add' element={<ModuleFormPage mode='add' />} />
          <Route path='/module/:moduleId/edit/:id' element={<ModuleFormPage mode='edit' />} />
        </Route>
      </Route>

      <Route
        path='*'
        element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App