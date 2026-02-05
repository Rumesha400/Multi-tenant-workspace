import { useAuth } from "@/context/AuthContext";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated)
    const { token } = useAuth()

    if (!isAuth) {
        return <Navigate to="/login" />
    }
    return children
}