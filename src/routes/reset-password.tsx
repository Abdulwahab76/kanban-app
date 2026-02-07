import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Lock, Eye, EyeClosed, LayoutDashboard } from 'lucide-react'

export const Route = createFileRoute('/reset-password')({
    component: ResetPassword,
})

function ResetPassword() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const handleReset = async () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        try {
            setLoading(true)
            setError('')
            setMessage('')

            const { error } = await supabase.auth.updateUser({
                password,
            })

            if (error) throw error

            setMessage('Password updated successfully 🎉')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Kanban App</h1>
            </div>

            {/* Card */}
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">Reset Password</h2>

                {/* Error / Success */}
                {error && <p className="p-2 bg-red-100 text-red-700 rounded">{error}</p>}
                {message && <p className="p-2 bg-green-100 text-green-700 rounded">{message}</p>}

                {/* Password Input */}
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="New password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <Eye /> : <EyeClosed />}
                    </button>
                </div>

                {/* Password hint */}
                <p className="text-sm text-gray-500">
                    Use at least 8 characters for a strong password
                </p>

                {/* Reset Button */}
                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                >
                    {loading ? 'Updating…' : 'Update Password'}
                </button>
            </div>
        </div>
    )
}
