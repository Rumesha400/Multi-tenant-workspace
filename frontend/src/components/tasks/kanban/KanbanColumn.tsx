import type { KanbanColumnProps } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";
import React from "react";

// export default function KanbanColumn ({ status, tasks }: KanbanColumnProps) {
//     const { setNodeRef } = useDroppable({ id: status });

//     return (
//         <div className="bg-muted/40 flex flex-col rounded-lg p-3 min-h-[400px]" ref={setNodeRef}>
//             <h2 className="font-semibold mb-3">{status} ({tasks.length})</h2>
//             <div className="space-y-2">
//                 {tasks.map((task) => (
//                     <KanbanCard key={task.id} task={task} />
//                 ))}
//             </div>
//         </div>
//     );
// }

const KanbanColumn = ({ status, tasks }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 min-h-[400px] transition-colors ${
        isOver ? "bg-blue-50 ring-2 ring-blue-300" : ""
      }`}
    >
      <h2 className="font-semibold text-lg mb-4 capitalize">
        {status.replace("_", " ")}
      </h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

// Memoize column to prevent re-renders when other columns update
export default React.memo(KanbanColumn);
