"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Loader2, Eye, EyeOff, UserPlus } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                identifier,
                password,
                redirect: false,
            });

            if (result?.error) {
                // Check for specific error messages
                if (result.error.includes("pending")) {
                    setError("Your account is pending approval. Please wait for admin approval.");
                } else if (result.error.includes("rejected")) {
                    setError("Your registration was rejected. Please contact administrator.");
                } else if (result.error.includes("locked")) {
                    setError("Account is locked. Please contact administrator.");
                } else {
                    setError("Invalid Student ID/Email or password");
                }
            } else if (result?.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-2xl mb-4 shadow-lg">
                        <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">NextLMS</h1>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Learning Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5 sm:mb-6">
                        Welcome Back
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 sm:mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div>
                            <label
                                htmlFor="identifier"
                                className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                            >
                                Student ID
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm sm:text-base"
                                placeholder="STU-2026-00001"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Students: Use your Student ID (e.g., STU-2026-00001)
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm sm:text-base"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200">
                        <p className="text-sm text-center text-gray-600">
                            Don't have an account?
                        </p>
                        <Link
                            href="/register"
                            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary/5 transition-colors text-sm sm:text-base"
                        >
                            <UserPlus className="w-4 h-4" />
                            Register as Student
                        </Link>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2 sm:mb-3 font-medium">
                            Demo Credentials:
                        </p>
                        <div className="space-y-1.5 sm:space-y-2 text-xs">
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span className="font-medium text-gray-700">Admin:</span>
                                <span className="text-gray-600">admin@lms.com / admin123</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span className="font-medium text-gray-700">Teacher:</span>
                                <span className="text-gray-600">teacher@lms.com / teacher123</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6">
                    © 2026 NextLMS. All rights reserved.
                </p>
            </div>
        </div>
    );
}
