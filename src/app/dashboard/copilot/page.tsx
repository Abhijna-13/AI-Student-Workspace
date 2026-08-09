"use client";

import { FormEvent, useState } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function CopilotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function sendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!input.trim() || loading) return;

        const userMessage = input.trim();

        setInput("");

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                role: "user",
                content: userMessage,
            },
        ]);

        setLoading(true);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: "assistant",
                    content: data.reply,
                },
            ]);
        } catch (error) {
            console.error("Copilot error:", error);

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: "assistant",
                    content:
                        "Sorry, I couldn't process your request. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col p-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    AI Copilot
                </h1>

                <p className="mt-3 text-lg text-zinc-500">
                    Your intelligent assistant for managing your student workspace.
                </p>
            </div>

            {/* Chat area */}
            <div className="mt-8 flex-1 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                {messages.length === 0 ? (
                    <div className="flex h-full min-h-[400px] items-center justify-center">
                        <div className="max-w-lg text-center">
                            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                                How can I help?
                            </h2>

                            <p className="mt-3 text-zinc-500">
                                Ask me something about your tasks, goals, skills, or notes.
                            </p>

                            <div className="mt-6 grid gap-3 text-left">
                                <div className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    "Help me plan my study schedule."
                                </div>

                                <div className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    "What should I focus on today?"
                                </div>

                                <div className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    "Give me some advice for learning DSA."
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-2xl rounded-2xl px-5 py-3 ${message.role === "user"
                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-zinc-100 px-5 py-3 text-zinc-500 dark:bg-zinc-800">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={sendMessage}
                className="mt-4 flex gap-3"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask your AI Copilot..."
                    disabled={loading}
                    className="flex-1 rounded-xl border border-zinc-300 bg-white px-5 py-4 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />

                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="rounded-xl bg-zinc-900 px-6 py-4 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                    {loading ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
}