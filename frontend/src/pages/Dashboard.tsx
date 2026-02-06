// frontend\src\pages\Dashboard.tsx

import StatCard from "@/components/dashboard/StatCard";
import { AlertCircle, CheckCircle, Clock, Folder, ListTodo } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Tasks" value={42} icon={<ListTodo size={28} />} />
                <StatCard title="Completed" value={18} icon={<CheckCircle size={28} />} />
                <StatCard title="Pending" value={15} icon={<Clock size={28} />} />
                <StatCard title="Overdue" value={3} icon={<AlertCircle size={28} />} />
                <StatCard title="Projects" value={6} icon={<Folder size={28} />} />

            </div>
        </div>
    )
}