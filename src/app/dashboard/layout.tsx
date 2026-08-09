import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white">
            {/* Sidebar */}
            <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">
                <div className="p-6">
                    <h1 className="text-xl font-bold">
                        AI Student
                        <br />
                        Workspace
                    </h1>
                </div>

                <nav className="flex-1 px-4">
                    <div className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="block rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            Overview
                        </Link>

                        <Link
                            href="/dashboard/tasks"
                            className="block rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            Tasks
                        </Link>

                        <Link
                            href="/dashboard/goals"
                            className="block rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            Goals
                        </Link>

                        <Link
                            href="/dashboard/skills"
                            className="block rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            Skills
                        </Link>

                        <Link
                            href="/dashboard/notes"
                            className="block rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            Notes
                        </Link>

                        <Link
                            href="/dashboard/copilot"
                            className="block rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            AI Copilot
                        </Link>
                    </div>
                </nav>

                {/* User section */}
                <div className="border-t border-zinc-800 p-4">
                    <p className="mb-3 truncate px-2 text-sm text-zinc-400">
                        {user?.email}
                    </p>

                    <LogoutButton />
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}