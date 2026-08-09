"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Goal = {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
};

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Load goals from Supabase
    useEffect(() => {
        loadGoals();
    }, []);

    async function loadGoals() {
        setLoading(true);

        const { data, error } = await supabase
            .from("goals")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading goals:", error);
        } else {
            setGoals(data ?? []);
        }

        setLoading(false);
    }

    // Create a goal
    async function createGoal() {
        if (!title.trim()) return;

        setCreating(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to create a goal.");
            setCreating(false);
            return;
        }

        const { data, error } = await supabase
            .from("goals")
            .insert({
                title: title.trim(),
                description: description.trim() || null,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating goal:", error);
            alert(error.message);
        } else if (data) {
            setGoals((currentGoals) => [data, ...currentGoals]);
            setTitle("");
            setDescription("");
            setShowForm(false);
        }

        setCreating(false);
    }

    // Mark goal as completed / active
    async function toggleGoal(goal: Goal) {
        const { data, error } = await supabase
            .from("goals")
            .update({
                completed: !goal.completed,
            })
            .eq("id", goal.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating goal:", error);
            alert(error.message);
            return;
        }

        if (data) {
            setGoals((currentGoals) =>
                currentGoals.map((currentGoal) =>
                    currentGoal.id === goal.id ? data : currentGoal
                )
            );
        }
    }

    // Delete a goal
    async function deleteGoal(goalId: number) {
        const { error } = await supabase
            .from("goals")
            .delete()
            .eq("id", goalId);

        if (error) {
            console.error("Error deleting goal:", error);
            alert(error.message);
            return;
        }

        setGoals((currentGoals) =>
            currentGoals.filter((goal) => goal.id !== goalId)
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Goals</h1>

                    <p className="mt-3 text-lg text-zinc-500">
                        Set goals and track your progress.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                    + Add Goal
                </button>
            </div>

            {/* Create Goal Form */}
            {showForm && (
                <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-xl font-semibold">Create a Goal</h2>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter goal title"
                        className="mt-5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your goal (optional)"
                        rows={4}
                        className="mt-4 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                    />

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={createGoal}
                            disabled={creating || !title.trim()}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create Goal"}
                        </button>

                        <button
                            onClick={() => {
                                setShowForm(false);
                                setTitle("");
                                setDescription("");
                            }}
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Goals List */}
            <div className="mt-8">
                {loading ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">Loading goals...</p>
                    </div>
                ) : goals.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">
                            No goals yet. Create your first goal!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => (
                            <div
                                key={goal.id}
                                className="flex items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                            >
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        checked={goal.completed}
                                        onChange={() => toggleGoal(goal)}
                                        className="mt-1 h-5 w-5 cursor-pointer"
                                    />

                                    <div>
                                        <p
                                            className={`font-medium ${goal.completed
                                                    ? "text-zinc-500 line-through"
                                                    : "text-white"
                                                }`}
                                        >
                                            {goal.title}
                                        </p>

                                        {goal.description && (
                                            <p className="mt-2 text-sm text-zinc-500">
                                                {goal.description}
                                            </p>
                                        )}

                                        <p className="mt-2 text-sm text-zinc-500">
                                            {goal.completed ? "Completed" : "Active"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}