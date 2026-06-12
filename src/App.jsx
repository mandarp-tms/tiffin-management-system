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

const App = () => {
  const { currentUser } = useAuth()

  return (
    <Routes>
      <Route path='/login' element={
        currentUser ? <Navigate to='/dashboard' replace /> : <LoginPage />
      } />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/add-tiffin' element={<AddTiffinPage />} />
          <Route path='/approvals' element={<ApprovalsPage />} />
          <Route path='/reports' element={<ReportsPage />} />
          <Route path='/pricing' element={<PricingPage />} />
          <Route path='/my-bill' element={<MyBillPage />} />
          <Route path='/users' element={<UsersPage />} />
          <Route path='/tiffin-centers' element={<TiffinCentersPage />} />
        </Route>
      </Route>

      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  )
}

export default App