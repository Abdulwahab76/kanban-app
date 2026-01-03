import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthComponent() {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');



    const handleManualLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim()
            });

            if (error) throw error;

            console.log('✅ Manual login successful!', data);

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        try {
            setLoading(true);
            setError('');

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) throw error;

            console.log('✅ Sign up successful! Check email.', data);
            alert('Sign up successful! Check your email for confirmation (if required).');

        } catch (err: any) {
            console.error('Sign up error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        console.log('Logged out');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Quick Test Login</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-3 border rounded"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 border rounded"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleManualLogin}
                            disabled={loading}
                            className="flex-1 bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        <button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="flex-1 bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-gray-500 text-white p-3 rounded hover:bg-gray-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>This is for testing only. After login, you can test boards and cards.</p>
                </div>
            </div>
        </div>
    );
}