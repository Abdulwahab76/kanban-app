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

    if (loading) return <LoadingScreen />
    if (!user) return <Navigate to="/boards" />

    return <AuthComponent />
}