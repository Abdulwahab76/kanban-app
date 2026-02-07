// src/routes/index.tsx
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import AuthComponent from '../components/Auth'
import { LoadingScreen } from '../components/ScreenStatus'

export const Route = createFileRoute('/')({
    component: IndexComponent,
})

function IndexComponent() {
    const { user, loading } = useAuth()

    if (loading) {
        console.log('⏳ index.tsx: Showing loading screen')
        return <LoadingScreen />
    }

    if (user) {
        console.log('✅ index.tsx: User found, redirecting to /boards')
        return <Navigate to="/boards" replace />
    }

    console.log('👤 index.tsx: No user, showing login')
    return <AuthComponent />

}