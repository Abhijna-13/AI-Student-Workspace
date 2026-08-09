"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
                <h1 className="text-3xl font-bold text-white">
                    Welcome back
                </h1>

                <p className="mt-2 text-zinc-400">
                    Login to your AI Student Workspace.
                </p>

                <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
                            placeholder="Your password"
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {message && (
                    <p className="mt-5 rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
                        {message}
                    </p>
                )}

                <p className="mt-6 text-center text-sm text-zinc-400">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-white hover:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </main>
    );
}