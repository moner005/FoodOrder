<<<<<<< HEAD
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

=======
import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
>>>>>>> hasan/auth-pages
export function MainLayout() {
  return (
    <>
      <Header />
<<<<<<< HEAD

      <main className="page-shell">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
=======
      <main className="page-shell">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>SwiftBite · project foundation</span>
        <span>Good food, made nearby.</span>
      </footer>
    </>
  );
}
>>>>>>> hasan/auth-pages
