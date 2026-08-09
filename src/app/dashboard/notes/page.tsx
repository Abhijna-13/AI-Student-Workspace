"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Note = {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load notes
    useEffect(() => {
        loadNotes();
    }, []);

    async function loadNotes() {
        setLoading(true);

        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error loading notes:", error);
        } else {
            setNotes(data ?? []);
        }

        setLoading(false);
    }

    // Create note
    async function createNote() {
        if (!title.trim()) return;

        setSaving(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to create a note.");
            setSaving(false);
            return;
        }

        const { data, error } = await supabase
            .from("notes")
            .insert({
                title: title.trim(),
                content,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating note:", error);
            alert(error.message);
        } else if (data) {
            setNotes((currentNotes) => [data, ...currentNotes]);
            resetForm();
        }

        setSaving(false);
    }

    // Update note
    async function updateNote() {
        if (!editingNote || !title.trim()) return;

        setSaving(true);

        const { data, error } = await supabase
            .from("notes")
            .update({
                title: title.trim(),
                content,
                updated_at: new Date().toISOString(),
            })
            .eq("id", editingNote.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating note:", error);
            alert(error.message);
        } else if (data) {
            setNotes((currentNotes) =>
                currentNotes.map((note) =>
                    note.id === editingNote.id ? data : note
                )
            );

            resetForm();
        }

        setSaving(false);
    }

    // Delete note
    async function deleteNote(noteId: number) {
        const { error } = await supabase
            .from("notes")
            .delete()
            .eq("id", noteId);

        if (error) {
            console.error("Error deleting note:", error);
            alert(error.message);
            return;
        }

        setNotes((currentNotes) =>
            currentNotes.filter((note) => note.id !== noteId)
        );
    }

    // Start editing
    function startEditing(note: Note) {
        setEditingNote(note);
        setTitle(note.title);
        setContent(note.content);
        setShowForm(true);
    }

    // Reset form
    function resetForm() {
        setTitle("");
        setContent("");
        setEditingNote(null);
        setShowForm(false);
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Notes</h1>

                    <p className="mt-3 text-lg text-zinc-500">
                        Capture ideas, study notes, and important information.
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                    + Add Note
                </button>
            </div>

            {/* Note Form */}
            {showForm && (
                <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="text-xl font-semibold">
                        {editingNote ? "Edit Note" : "Create a Note"}
                    </h2>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title"
                        className="mt-5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                    />

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your note here..."
                        rows={8}
                        className="mt-4 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                    />

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={editingNote ? updateNote : createNote}
                            disabled={saving || !title.trim()}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingNote
                                    ? "Save Changes"
                                    : "Create Note"}
                        </button>

                        <button
                            onClick={resetForm}
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Notes List */}
            <div className="mt-8">
                {loading ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">Loading notes...</p>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-500">
                            No notes yet. Create your first note!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                            >
                                <h2 className="text-lg font-semibold text-white">
                                    {note.title}
                                </h2>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                                    {note.content}
                                </p>

                                <div className="mt-5 flex items-center gap-3">
                                    <button
                                        onClick={() => startEditing(note)}
                                        className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}