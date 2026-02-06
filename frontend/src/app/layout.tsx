// frontend\src\app\layout.tsx

import Sidebar from "@/components/common/Sidebar";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="h-screen flex bg-background text-foreground">
            {/* Sidebar  */}
            <aside className="w-64 border-r border-border p-4 flex flex-col">
                <h2 className="text-lg font-semibold mb-4">Task Manager</h2>
                <Sidebar />
            </aside>
            {/* Main Content  */}
            <main className="flex-1 p-6 overflow-auto">
                {children}
            </main>
        </div>
    )
}