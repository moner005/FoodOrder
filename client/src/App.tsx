import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/services/queryClient'
import { router } from '@/routes'
export default function App() { return <QueryClientProvider client={queryClient}><RouterProvider router={router}/><Toaster position="top-right"/></QueryClientProvider> }
