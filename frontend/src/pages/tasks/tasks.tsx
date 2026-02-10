// frontend\src\pages\tasks\tasks.tsx

import CommonLoader from "@/components/common/Loader";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import KanbanBoard from "@/components/tasks/kanban/KanbanBoard";
import type { RootState } from "@/store";
import { useGetTasksQuery } from "@/store/api/taskApi";
import { useSelector } from "react-redux";
import ActivityPanel from "@/components/activity/ActivityPanel";

export default function Tasks() {
  const projectId = useSelector(
    (state: RootState) => state.project.currentProjectId,
  );

  const { data, isLoading } = useGetTasksQuery(
    {
      projectId: projectId || "",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    },
    { skip: !projectId },
  );

  return isLoading ? (
    <CommonLoader />
  ) : (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Tasks</h1>
      <CreateTaskModal />
      {/* {data?.data?.map((task: Task) => (
                <div
                    key={task.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                ><h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                        {task.status} • {task.priority}
                    </p>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setSelectedTask(task)}
                    >
                        Edit
                    </Button>
                </div>
            ))} */}

<div className="flex gap-4">
    <div className="flex-1">
      {data?.data && <KanbanBoard tasks={data.data || []} />}
    </div>

    <div className="hidden lg:block">
        <ActivityPanel />
    </div>
</div>

      {/* <EditTaskModal
                open={!!selectedTask}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
            /> */}
    </div>
  );
}
