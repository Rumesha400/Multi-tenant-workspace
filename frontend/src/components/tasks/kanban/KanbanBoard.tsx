import { useUpdateTaskMutation } from "@/store/api/taskApi";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useApiError } from "@/hooks/useApiError";
import CommonLoader from "@/components/common/Loader";
import type { KanbanBoardProps } from "@/types";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const STATUSES = ["OPEN", "IN_PROGRESS", "BLOCKED", "DONE"];

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const getErrorMessage = useApiError();
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [activeTask, setActiveTask] = useState(null);

  const [onlyMine, setOnlyMine] = useState(false);
  const [priority, setPriority] = useState<string | null>(null);

  const role = useSelector((state: any) => state.auth?.user?.role) || "MEMBER";
  console.log(role, "role");
  

  // Better drag activation - prevents accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
  );

  const groupByAssignee = (tasks: any[]) => {
    const map: Record<string, any[]> = {};

    tasks.forEach((task) => {
      const key = task.assignee?.id || "unassigned";

      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(task);
    });
    return map;
  };

  let filtered = tasks;

  if (onlyMine) {
    filtered = filtered.filter((t) => t.assignee?.id === "ME");
  }

  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  const onDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    if (role !== "OWNER" && role !== "ADMIN") {
      toast.error("You are not allowed to move tasks");
      return;
    }
    
    const { active, over } = event;
    
    setActiveTask(null);
    
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const oldTask = tasks.find((t) => t.id === taskId);

    // Don't update if status hasn't changed
    if (oldTask?.status === newStatus) return;

    try {
      await updateTask({
        id: taskId,
        data: { status: newStatus },
      }).unwrap();
      toast.success("Task moved successfully");
    } catch (error: any) {
      if (error?.status === 403) {
        toast.error("You don't have permission to move this task");
        return;
      }

      toast.error(getErrorMessage(error));
    }
  };

  const onDragCancel = () => {
    setActiveTask(null);
  };

  const grouped = groupByAssignee(filtered);

  return isLoading ? (
    <CommonLoader />
  ) : (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Button
          variant={onlyMine ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyMine(!onlyMine)}
        >
          My Tasks
        </Button>

        <Button
          variant={priority === "HIGH" ? "default" : "outline"}
          size="sm"
          onClick={() => setPriority(priority === "HIGH" ? null : "HIGH")}
        >
          High Priority
        </Button>
      </div>

      <DndContext
        onDragEnd={onDragEnd}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
      >
          {Object.entries(grouped).map(([assigneeId, list]) => {
            const name = list[0]?.assignee?.name || "Unassigned";

            return (
              <>
                <div className="space-y-3" key={assigneeId}>
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATUSES.map((status) => (
                    <KanbanColumn
                      key={status}
                      status={status}
                      tasks={list.filter((t) => t.status === status)}
                    />
                  ))}
                </div>
              </>
            );
          })}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="w-full max-w-[280px] opacity-90 rotate-3 cursor-grabbing">
              <KanbanCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
