// frontend\src\components\common\Sidebar.tsx

import { CheckSquare, FolderKanban, LayoutDashboard, LogOut, Settings } from "lucide-react"
import { Button } from "../ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { type RootState } from "@/store"
import { logout } from "@/store/slices/authSlice"
import { clearProject } from "@/store/slices/projectSlice"

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
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout())
        dispatch(clearProject())
        navigate("/login")
    }

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
            <div className="mt-auto pt-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    Logout
                </Button>
            </div>
        </div>
    )
}