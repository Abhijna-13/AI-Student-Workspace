"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const [pendingTasks, setPendingTasks] = useState(0);
    const [activeGoals, setActiveGoals] = useState(0);
    const [skillCount, setSkillCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        // Pending tasks
        const { count: taskCount, error: taskError } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("completed", false);

        if (taskError) {
            console.error("Error loading task count:", taskError);
        } else {
            setPendingTasks(taskCount ?? 0);
        }

        // Active goals
        const { count: goalCount, error: goalError } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("completed", false);

        if (goalError) {
            console.error("Error loading goal count:", goalError);
        } else {
            setActiveGoals(goalCount ?? 0);
        }

        // Skills being tracked
        const { count: skillsCount, error: skillsError } = await supabase
            .from("skills")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (skillsError) {
            console.error("Error loading skill count:", skillsError);
        } else {
            setSkillCount(skillsCount ?? 0);
        }

        setLoading(false);
    }

    return (
        <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Dashboard
                </h1>

                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Welcome to your AI Student Workspace.
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Tasks */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="font-semibold text-zinc-900 dark:text-white">
                            Tasks
                        </h2>

                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                            {loading ? "..." : pendingTasks}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                            Pending tasks
                        </p>
                    </div>

                    {/* Goals */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="font-semibold text-zinc-900 dark:text-white">
                            Goals
                        </h2>

                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                            {loading ? "..." : activeGoals}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                            Active goals
                        </p>
                    </div>

                    {/* Skills */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="font-semibold text-zinc-900 dark:text-white">
                            Skills
                        </h2>

                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                            {loading ? "..." : skillCount}
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