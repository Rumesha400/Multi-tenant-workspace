import { CheckSquare, FolderKanban, LayoutDashboard, Settings } from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { type RootState } from "@/store"

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
    const { currentProjectName } = useSelector((state: RootState) => state.project)
    return (
        <div className="h-full flex flex-col gap-2 mt-6">
            {currentProjectName && (
                <div className="text-sm text-muted-foreground">Project: {currentProjectName}</div>
            )}
            {menuItems.map((item) => (
                <Link to={item.path} key={item.label} className="w-full">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                    >
                        <item.icon size={18} />
                        {item.label}
                    </Button>
                </Link>
            ))}
        </div>
    )
}