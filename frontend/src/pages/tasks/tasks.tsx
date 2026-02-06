// frontend\src\pages\tasks\tasks.tsx

import CommonLoader from "@/components/common/Loader";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import type { RootState } from "@/store"
import { useGetTasksQuery } from "@/store/api/taskApi";
import { handleApiError } from "@/utils/errorHandler";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"

export default function Tasks() {
    const dispatch = useDispatch();
    const projectId = useSelector((state: RootState) => state.project.currentProjectId);

    const { data, isLoading, error } = useGetTasksQuery({
        projectId: projectId || "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        order: "desc",
    }, { skip: !projectId });

    useEffect(() => {
        if (error) {
            handleApiError(error, dispatch)
        }
    }, [error, dispatch]);

    return isLoading ? <CommonLoader /> : (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold">Tasks</h1>
            <CreateTaskModal />
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