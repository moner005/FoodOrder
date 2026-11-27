import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '@/pages/Home/marketplace.css'

export function MainLayout() {
  return (
    <>
      <Header />
      <div className="sb-demo-note sb-global-note">Local preview · Orders are saved by the connected demo service. No payment details are collected.</div>

      <main className="page-shell">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
