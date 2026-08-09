import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// CREATE TASK
// =====================================================

const createTaskTool = {
    name: "create_task",
    description:
        "Create a new task for the currently logged-in student. Use this when the user asks to create, add, or make a task.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "The title of the task.",
            },
        },
        required: ["title"],
    },
};

// =====================================================
// LIST TASKS
// =====================================================

const listTasksTool = {
    name: "list_tasks",
    description:
        "List the currently logged-in student's tasks. Use this when the user asks what tasks they have, what tasks are pending, or what tasks are completed.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            status: {
                type: Type.STRING,
                description:
                    "Filter tasks by status. Use pending, completed, or all.",
                enum: ["pending", "completed", "all"],
            },
        },
    },
};

// =====================================================
// COMPLETE TASK
// =====================================================

const completeTaskTool = {
    name: "complete_task",
    description:
        "Mark a specific task as completed. IMPORTANT: Use this tool when the user says 'complete', 'finish', 'done', or 'mark as completed'. The taskTitle should be the name of the task the user mentioned.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskTitle: {
                type: Type.STRING,
                description:
                    "The exact or closest title of the task the user wants to mark as completed.",
            },
        },
        required: ["taskTitle"],
    },
};

// =====================================================
// TOOLS
// =====================================================

const tools = [
    {
        functionDeclarations: [
            createTaskTool,
            listTasksTool,
            completeTaskTool,
        ],
    },
];

// =====================================================
// POST
// =====================================================

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                {
                    error: "Message is required",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // SUPABASE
        // =================================================

        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "You must be logged in to use the AI Copilot.",
                },
                {
                    status: 401,
                }
            );
        }

        // =================================================
        // GEMINI
        // =================================================

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",

            contents: message,

            config: {
                systemInstruction:
                    "You are the AI Copilot for a student workspace. " +
                    "You help users manage their tasks. " +
                    "\n\n" +
                    "IMPORTANT TOOL RULES:" +
                    "\n" +
                    "- If the user asks to CREATE, ADD, or MAKE a task, use create_task." +
                    "\n" +
                    "- If the user asks to SEE, SHOW, LIST, or CHECK their tasks, use list_tasks." +
                    "\n" +
                    "- If the user asks to COMPLETE, FINISH, MARK DONE, or MARK AS COMPLETED, use complete_task." +
                    "\n" +
                    "- Do NOT use list_tasks when the user explicitly asks to complete a task." +
                    "\n" +
                    "- Never claim an action was completed unless the corresponding tool succeeds.",

                tools,
            },
        });

        // =================================================
        // FUNCTION CALL
        // =================================================

        if (
            response.functionCalls &&
            response.functionCalls.length > 0
        ) {
            const functionCall = response.functionCalls[0];

            // =================================================
            // CREATE TASK
            // =================================================

            if (functionCall.name === "create_task") {
                const title = String(
                    functionCall.args?.title ?? ""
                ).trim();

                if (!title) {
                    return NextResponse.json({
                        reply:
                            "I need a task title before I can create it.",
                    });
                }

                const {
                    data: task,
                    error,
                } = await supabase
                    .from("tasks")
                    .insert({
                        title,
                        user_id: user.id,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error(
                        "CREATE TASK ERROR:",
                        error
                    );

                    return NextResponse.json(
                        {
                            error:
                                "I couldn't create the task.",
                        },
                        {
                            status: 500,
                        }
                    );
                }

                return NextResponse.json({
                    reply:
                        `Done! I created the task "${task.title}".`,
                });
            }

            // =================================================
            // LIST TASKS
            // =================================================

            if (functionCall.name === "list_tasks") {
                const status = String(
                    functionCall.args?.status ?? "pending"
                );

                let query = supabase
                    .from("tasks")
                    .select(
                        "id, title, completed, created_at"
                    )
                    .eq("user_id", user.id)
                    .order("created_at", {
                        ascending: false,
                    });

                if (status === "pending") {
                    query = query.eq("completed", false);
                }

                if (status === "completed") {
                    query = query.eq("completed", true);
                }

                const {
                    data: tasks,
                    error,
                } = await query;

                if (error) {
                    console.error(
                        "LIST TASKS ERROR:",
                        error
                    );

                    return NextResponse.json(
                        {
                            error:
                                "I couldn't retrieve your tasks.",
                        },
                        {
                            status: 500,
                        }
                    );
                }

                if (!tasks || tasks.length === 0) {
                    return NextResponse.json({
                        reply:
                            status === "completed"
                                ? "You don't have any completed tasks yet."
                                : status === "all"
                                    ? "You don't have any tasks yet."
                                    : "You don't have any pending tasks.",
                    });
                }

                const taskList = tasks
                    .map(
                        (task, index) =>
                            `${index + 1}. ${task.title} (ID: ${task.id})`
                    )
                    .join("\n");

                return NextResponse.json({
                    reply:
                        status === "completed"
                            ? `You have ${tasks.length} completed task${tasks.length === 1 ? "" : "s"}:\n\n${taskList}`
                            : status === "all"
                                ? `You have ${tasks.length} task${tasks.length === 1 ? "" : "s"}:\n\n${taskList}`
                                : `You have ${tasks.length} pending task${tasks.length === 1 ? "" : "s"}:\n\n${taskList}`,
                });
            }

            // =================================================
            // COMPLETE TASK
            // =================================================

            if (functionCall.name === "complete_task") {
                const taskTitle = String(
                    functionCall.args?.taskTitle ?? ""
                ).trim();

                if (!taskTitle) {
                    return NextResponse.json({
                        reply:
                            "Which task would you like me to complete?",
                    });
                }

                console.log(
                    "COMPLETE TASK REQUEST:",
                    taskTitle
                );

                // -----------------------------------------------
                // Find the user's task
                // -----------------------------------------------

                const {
                    data: matchingTasks,
                    error: findError,
                } = await supabase
                    .from("tasks")
                    .select(
                        "id, title, completed"
                    )
                    .eq("user_id", user.id)
                    .ilike("title", taskTitle);

                if (findError) {
                    console.error(
                        "FIND TASK ERROR:",
                        findError
                    );

                    return NextResponse.json(
                        {
                            error:
                                "I couldn't find that task.",
                        },
                        {
                            status: 500,
                        }
                    );
                }

                // -----------------------------------------------
                // Task not found
                // -----------------------------------------------

                if (
                    !matchingTasks ||
                    matchingTasks.length === 0
                ) {
                    return NextResponse.json({
                        reply:
                            `I couldn't find a task named "${taskTitle}".`,
                    });
                }

                // -----------------------------------------------
                // Use first matching task
                // -----------------------------------------------

                const task = matchingTasks[0];

                // -----------------------------------------------
                // Already completed
                // -----------------------------------------------

                if (task.completed) {
                    return NextResponse.json({
                        reply:
                            `"${task.title}" is already completed.`,
                    });
                }

                // -----------------------------------------------
                // UPDATE TASK
                // -----------------------------------------------

                const {
                    data: updatedTask,
                    error: updateError,
                } = await supabase
                    .from("tasks")
                    .update({
                        completed: true,
                    })
                    .eq("id", task.id)
                    .eq("user_id", user.id)
                    .select()
                    .single();

                if (updateError) {
                    console.error(
                        "UPDATE TASK ERROR:",
                        updateError
                    );

                    return NextResponse.json(
                        {
                            error:
                                "I found the task, but I couldn't mark it as completed.",
                        },
                        {
                            status: 500,
                        }
                    );
                }

                console.log(
                    "TASK COMPLETED:",
                    updatedTask
                );

                return NextResponse.json({
                    reply:
                        `Done! I marked "${updatedTask.title}" as completed. ✅`,
                });
            }
        }

        // =================================================
        // NORMAL RESPONSE
        // =================================================

        return NextResponse.json({
            reply:
                response.text ||
                "I'm not sure how to help with that.",
        });
    } catch (error) {
        console.error(
            "GEMINI API ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to process your request.",
            },
            {
                status: 500,
            }
        );
    }
}