import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '@/pages/Home/marketplace.css'

export function MainLayout() {
  return (
    <>
      <Header />

      <main className="page-shell">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
