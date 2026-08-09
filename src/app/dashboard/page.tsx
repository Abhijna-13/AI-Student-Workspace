export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-zinc-950">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Dashboard
                </h1>

                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Welcome to your AI Student Workspace.
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="font-semibold text-zinc-900 dark:text-white">
                            Tasks
                        </h2>
                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                            0
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Pending tasks
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="font-semibold text-zinc-900 dark:text-white">
                            Goals
                        </h2>
                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                            0
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Active goals
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="font-semibold text-zinc-900 dark:text-white">
                            Skills
                        </h2>
                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                            0
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Skills being tracked
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}