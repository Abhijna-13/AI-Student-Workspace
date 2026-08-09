"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();

        await supabase.auth.signOut();

        router.push("/login");
        router.refresh();
    }

    return (
        <button
            onClick={handleLogout}
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-300 transition hover:bg-red-950/40 hover:text-red-300"
        >
            Logout
        </button>
    );
}