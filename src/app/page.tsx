export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <main className="flex w-full max-w-2xl flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          AI Student Workspace
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-xl">
          Your intelligent workspace for studying, planning, and achieving your goals.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
      href="/register"
      className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      Get Started
    </a>
        </div>
      </main>
    </div>
  );
}

