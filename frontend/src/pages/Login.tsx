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
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [loginMutation, { isLoading }] = useLoginMutation()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    function validate(): boolean {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!validate()) return;

        try {
            const res = await loginMutation({ email, password }).unwrap()

            dispatch(loginSuccess(res.access_token))
            toast.success("Login successful", { duration: 1000 })
            navigate("/")
        } catch (err: any) {
            const detail = err?.data?.detail;
            let message = "Login failed";

            if (typeof detail === "string") {
                message = detail;
            } else if (Array.isArray(detail) && detail.length > 0) {
                message = detail.map((e: any) => e.msg).join(", ");
            }

            toast.error(message, { duration: 3000 });
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-[380px]">
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-center">Login</h2>

                    <form onSubmit={handleSubmit} noValidate className="space-y-3">
                        <div>
                            <Input
                                placeholder="Email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                                }}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                                }}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}