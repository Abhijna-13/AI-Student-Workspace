"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Skill = {
    id: number;
    name: string;
    proficiency: number;
    created_at: string;
};

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [name, setName] = useState("");
    const [proficiency, setProficiency] = useState(50);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Load skills from Supabase
    useEffect(() => {
        loadSkills();
    }, []);

    async function loadSkills() {
        setLoading(true);

        const { data, error } = await supabase
            .from("skills")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading skills:", error);
        } else {
            setSkills(data ?? []);
        }

        setLoading(false);
    }

    // Create a skill
    async function createSkill() {
        if (!name.trim()) return;

        setCreating(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to create a skill.");
            setCreating(false);
            return;
        }

        const { data, error } = await supabase
            .from("skills")
            .insert({
                name: name.trim(),
                proficiency,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating skill:", error);
            alert(error.message);
        } else if (data) {
            setSkills((currentSkills) => [data, ...currentSkills]);
            setName("");
            setProficiency(50);
            setShowForm(false);
        }

        setCreating(false);
    }

    // Update skill proficiency
    async function updateSkill(skill: Skill, newProficiency: number) {
        const { data, error } = await supabase
            .from("skills")
            .update({
                proficiency: newProficiency,
            })
            .eq("id", skill.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating skill:", error);
            alert(error.message);
            return;
        }

        if (data) {
            setSkills((currentSkills) =>
                currentSkills.map((currentSkill) =>
                    currentSkill.id === skill.id ? data : currentSkill
                )
            );
        }
    }

    // Delete a skill
    async function deleteSkill(skillId: number) {
        const { error } = await supabase
            .from("skills")
            .delete()
            .eq("id", skillId);

        if (error) {
            console.error("Error deleting skill:", error);
            alert(error.message);
            return;
        }

        setSkills((currentSkills) =>
            currentSkills.filter((skill) => skill.id !== skillId)
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Skills</h1>

                    <p className="mt-3 text-lg text-zinc-500">
                        Track your skills and proficiency.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                    + Add Skill
                </button>
            </div>

            {/* Create Skill Form */}
            {showForm && (
                <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-xl font-semibold">Add a Skill</h2>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter skill name"
                        className="mt-5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                    />

                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-zinc-300">
                                Proficiency
                            </label>

                            <span className="text-sm font-semibold text-white">
                                {proficiency}%
                            </span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={proficiency}
                            onChange={(e) => setProficiency(Number(e.target.value))}
                            className="mt-3 w-full cursor-pointer"
                        />
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={createSkill}
                            disabled={creating || !name.trim()}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating ? "Adding..." : "Add Skill"}
                        </button>

                        <button
                            onClick={() => {
                                setShowForm(false);
                                setName("");
                                setProficiency(50);
                            }}
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Skills List */}
            <div className="mt-8">
                {loading ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">Loading skills...</p>
                    </div>
                ) : skills.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">
                            No skills yet. Add your first skill!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {skills.map((skill) => (
                            <div
                                key={skill.id}
                                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-white">
                                        {skill.name}
                                    </h2>

                                    <span className="text-sm font-medium text-zinc-400">
                                        {skill.proficiency}%
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                                    <div
                                        className="h-full rounded-full bg-white transition-all"
                                        style={{ width: `${skill.proficiency}%` }}
                                    />
                                </div>

                                {/* Proficiency slider */}
                                <div className="mt-5">
                                    <label className="text-xs text-zinc-500">
                                        Update proficiency
                                    </label>

                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={skill.proficiency}
                                        onChange={(e) =>
                                            updateSkill(skill, Number(e.target.value))
                                        }
                                        className="mt-2 w-full cursor-pointer"
                                    />
                                </div>

                                <button
                                    onClick={() => deleteSkill(skill.id)}
                                    className="mt-4 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
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