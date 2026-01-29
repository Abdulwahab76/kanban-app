import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);

    // 🔁 Listen auth state (important for Google redirect)
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    // 📧 Email login
    const handleManualLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim()
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Sign up
    const handleSignUp = async () => {
        try {
            setLoading(true);
            setError('');

            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) throw error;

            alert('Check your email for confirmation');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🔵 Google login
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }

            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // 🚪 Logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    // ✅ Already logged in
    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-xl shadow w-full max-w-md text-center space-y-4">
                    <h2 className="text-xl font-bold">Welcome 👋</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Login to Kanban
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-4">

                    {/* Google */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 border p-3 rounded-lg hover:bg-gray-50 transition"
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Password */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleManualLogin}
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                        >
                            Login
                        </button>

                        <button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
