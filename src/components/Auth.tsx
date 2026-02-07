import { useState, type JSX } from 'react'
import { supabase } from '../lib/supabase'
import { Eye, EyeClosed } from 'lucide-react'

export default function AuthComponent(): JSX.Element {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const resetState = () => {
        setError('')
        setMessage('')
    }

    // 🔐 Login
    const handleLogin = async () => {
        try {
            resetState()
            setLoading(true)

            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            })

            if (error) throw error
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // 🆕 Sign Up
    const handleSignUp = async () => {
        try {
            resetState()
            setLoading(true)

            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            setMessage('Check your email to confirm your account.')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // 🔁 Forgot Password
    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email first.')
            return
        }

        try {
            resetState()
            setLoading(true)

            const { error } = await supabase.auth.resetPasswordForEmail(
                email.trim(),
                {
                    redirectTo: `${window.location.origin}/reset-password`,
                }
            )

            if (error) throw error

            setMessage('Password reset email sent.')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // 🔵 Google Login
    const handleGoogleLogin = async () => {
        try {
            resetState()
            setLoading(true)

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            })

            if (error) throw error
        } catch (err) {
            setError((err as Error).message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold text-center">
                    Login to Kanban
                </h2>

                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}

                {/* Google */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 border p-3 rounded-lg hover:bg-gray-50"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="w-5 h-5"
                    />
                    Continue with Google
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300" />
                </div>

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                {/* Password with eye toggle */}
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <Eye /> : <EyeClosed />}
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                    >
                        Login
                    </button>

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="flex-1 bg-white text-black border  p-2 rounded-lg  shadow-sm"
                    >
                        Sign Up
                    </button>
                </div>

                {/* Forgot password */}
                <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full text-sm text-blue-600 hover:underline text-center"
                >
                    Forgot password?
                </button>
            </div>
        </div>
    )
}
