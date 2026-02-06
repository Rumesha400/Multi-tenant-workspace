// frontend\src\pages\Login.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/store/api/authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loginMutation, { isLoading }] = useLoginMutation()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            const res = await loginMutation({ email, password }).unwrap()

            dispatch(loginSuccess(res.access_token))
            toast.success("Login successful", { duration: 1000 })
            navigate("/")
        } catch (err: any) {
            toast.error(err?.data?.detail || "Login failed", { duration: 1000 })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-[380px]">
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-center">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}