"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage(
                "Registration successful! Check your email to confirm your account."
            );
        }

        setLoading(false);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
                <h1 className="text-3xl font-bold text-white">
                    Create your account
                </h1>

                <p className="mt-2 text-zinc-400">
                    Start using your AI Student Workspace.
                </p>

                <form onSubmit={handleRegister} className="mt-8 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-400"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Create a password"
                            minLength={6}
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                {message && (
                    <p className="mt-5 rounded-lg bg-zinc-800 p-3 text-sm text-zinc-300">
                        {message}
                    </p>
                )}

                <p className="mt-6 text-center text-sm text-zinc-400">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-white hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}