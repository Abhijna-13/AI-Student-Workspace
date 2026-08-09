"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Task = {
    id: number;
    title: string;
    completed: boolean;
    created_at: string;
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Load tasks from Supabase
    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        setLoading(true);

        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading tasks:", error);
        } else {
            setTasks(data ?? []);
        }

        setLoading(false);
    }

    // Create a new task
    async function createTask() {
        if (!title.trim()) return;

        setCreating(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to create a task.");
            setCreating(false);
            return;
        }

        const { data, error } = await supabase
            .from("tasks")
            .insert({
                title: title.trim(),
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating task:", error);
            alert(error.message);
        } else if (data) {
            setTasks((currentTasks) => [data, ...currentTasks]);
            setTitle("");
            setShowForm(false);
        }

        setCreating(false);
    }

    // Mark task as completed / pending
    async function toggleTask(task: Task) {
        const { data, error } = await supabase
            .from("tasks")
            .update({
                completed: !task.completed,
            })
            .eq("id", task.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating task:", error);
            alert(error.message);
            return;
        }

        if (data) {
            setTasks((currentTasks) =>
                currentTasks.map((currentTask) =>
                    currentTask.id === task.id ? data : currentTask
                )
            );
        }
    }

    // Delete a task
    async function deleteTask(taskId: number) {
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);

        if (error) {
            console.error("Error deleting task:", error);
            alert(error.message);
            return;
        }

        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId)
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Tasks</h1>

                    <p className="mt-3 text-lg text-zinc-500">
                        Manage your tasks and stay organized.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                    + Add Task
                </button>
            </div>

            {/* Create Task Form */}
            {showForm && (
                <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-xl font-semibold">Create a Task</h2>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                createTask();
                            }
                        }}
                        placeholder="Enter task title"
                        className="mt-5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                    />

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={createTask}
                            disabled={creating || !title.trim()}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create Task"}
                        </button>

                        <button
                            onClick={() => {
                                setShowForm(false);
                                setTitle("");
                            }}
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Tasks List */}
            <div className="mt-8">
                {loading ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">
                            No tasks yet. Create your first task!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                            >
                                {/* Task information */}
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task)}
                                        className="h-5 w-5 cursor-pointer"
                                    />

                                    <div>
                                        <p
                                            className={`font-medium ${task.completed
                                                    ? "text-zinc-500 line-through"
                                                    : "text-white"
                                                }`}
                                        >
                                            {task.title}
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            {task.completed ? "Completed" : "Pending"}
                                        </p>
                                    </div>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={() => deleteTask(task.id)}
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