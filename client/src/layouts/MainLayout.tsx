import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
export function MainLayout() { return <><Header/><main className="page-shell"><Outlet/></main><footer className="site-footer"><span>FoodOrder · project foundation</span><span>Good food, made nearby.</span></footer></> }
