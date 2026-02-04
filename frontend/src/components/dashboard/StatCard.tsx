import type { ReactNode } from "react";
import { Card, CardContent } from "../ui/card";

interface StatCardProps {
    title: string,
    value: number,
    icon: ReactNode
}
export default function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <Card className="p-4">
            <CardContent className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                </div>
                <div className="text-muted-foreground">
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}