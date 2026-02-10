import { Badge } from "@/components/ui/badge";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { KanbanCardProps } from "@/types";
import EditTaskModal from "../EditTaskModal";
import { GripVertical } from "lucide-react";

export default function KanbanCard({ task }: KanbanCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => setIsOpen(true)}
        className="bg-background border rounded-md p-3 cursor-pointer space-y-2 transition hover:shadow-md hover:border-primary/40 relative group"
      >
        <div {...attributes} {...listeners} className="absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab">
          <GripVertical size={16} />
        </div>
        <h4 className="text-sm font-medium leading-snug">{task.title}</h4>

        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label: string) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center pt-1">
          <span
            className={`text-xs font-medium ${task.priority === "HIGH" ? "text-red-500" : task.priority === "MEDIUM" ? "text-orange-500" : "text-green-500"}`}
          >
            {task.priority}
          </span>

          {task.assignee?.name && (
            <div className="w-7 h-7 rounded-full bg-primary/10 text-xs flex items-center justify-center font-semibold">
                {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        </div>
      <EditTaskModal
        open={isOpen}
        task={task}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
