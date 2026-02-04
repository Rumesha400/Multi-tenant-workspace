import { CheckSquare, FolderKanban, LayoutDashboard, Settings } from "lucide-react"
import { Button } from "../ui/button"

const menuItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/"
    },
    {
        label: "Projects",
        icon: FolderKanban,
        path: "/projects"
    },
    {
        label: "Tasks",
        icon: CheckSquare,
        path: "/tasks"
    },
    {
        label: "Settings",
        icon: Settings,
        path: "/settings"
    }
]

export default function Sidebar() {
    return (
        <div className="h-full flex flex-col gap-2 mt-6">
            {menuItems.map((item) => (
                <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                >
                    <item.icon size={18} />
                    {item.label}
                </Button>
            ))}
        </div>
    )
}