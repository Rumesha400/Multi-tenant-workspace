import CommonLoader from "@/components/common/Loader";
import type { RootState } from "@/store"
import { useGetTasksQuery } from "@/store/api/taskApi";
import { useEffect } from "react";
import { useSelector } from "react-redux"
import { toast } from "sonner";

export default function Tasks() {
    const projectId = useSelector((state: RootState) => state.project.currentProjectId);

    const { data, isLoading } = useGetTasksQuery({
        projectId: projectId || "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        order: "desc",
    }, { skip: !projectId });
    console.log(data, "data of tasks", projectId);

    useEffect(() => {
        if (!projectId) {
            toast.error("Please select a project");
        }
    }, [projectId]);

    return isLoading ? <CommonLoader /> : (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold">Tasks</h1>

            {data?.data?.map((task: any) => (
                <div
                    key={task.id}
                    className="border rounded-lg p-4"
                >
                    <h3 className="font-medium">{task.title}</h3>

                    <p className="text-sm text-muted-foreground">
                        {task.status} • {task.priority}
                    </p>
                </div>
            ))}
        </div>
    )
}