import { createContext, useContext, useEffect, useState } from "react"

import { jwtDecode } from "jwt-decode"

interface DecodedToken {
    user_id: string
    org_id: string
    role: string
    exp: number
}

interface User {
    id: string
    orgId: string
    role: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (t: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem("token")
        if (saved) {
            handleLogin(saved)
        }
    }, [])

    function handleLogin(token: string) {
        const decoded = jwtDecode<DecodedToken>(token)

        const userData: User = {
            id: decoded.user_id,
            orgId: decoded.org_id,
            role: decoded.role,
        }

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(userData))

        setToken(token)
        setUser(userData)
    }

    function logout() {
        localStorage.clear()
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login: handleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)

    if (!ctx) {
        throw new Error("useAuth must be inside AuthProvider")
    }

    return ctx
}