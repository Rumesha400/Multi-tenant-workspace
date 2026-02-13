// frontend\src\pages\tasks\tasks.tsx

import CommonLoader from "@/components/common/Loader";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import KanbanBoard from "@/components/tasks/kanban/KanbanBoard";
import type { RootState } from "@/store";
import { useGetTasksQuery } from "@/store/api/taskApi";
import { useSelector } from "react-redux";
import ActivityPanel from "@/components/activity/ActivityPanel";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TaskFilters from "@/components/tasks/TaskFilters";
import { useDebounce } from "use-debounce";

export default function Tasks() {
  const projectId = useSelector(
    (state: RootState) => state.project.currentProjectId,
  );

  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // On page load → restore filters from URL
  useEffect(() => {
    const s = params.get("search");
    const st = params.get("status");
    const p = params.get("priority");

    if (s) setSearch(s);
    if (st) setStatus(st);
    if (p) setPriority(p);
  }, []);

  // When filters change → update the URL
  useEffect(() => {
    const query: Record<string, string> = {};

    if (debouncedSearch) query.search = debouncedSearch;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    setParams(query, { replace: true });
  }, [debouncedSearch, status, priority]);

  const { data, isLoading } = useGetTasksQuery({
    projectId: projectId || "",
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  },
    { skip: !projectId },
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  return isLoading ? (
    <CommonLoader />
  ) : (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Tasks</h1>
      <CreateTaskModal />

      <TaskFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        onReset={() => {
          setSearch("");
          setStatus(null);
          setPriority(null);
        }}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          {data?.data && <KanbanBoard tasks={data.data || []} onSelect={toggleSelect} selectedIds={selectedIds} />}
        </div>

        <div className="hidden lg:block">
          <ActivityPanel />
        </div>
      </div>

    </div>
  );
}
