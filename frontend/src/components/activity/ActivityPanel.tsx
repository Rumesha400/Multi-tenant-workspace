import { useSelector } from "react-redux";
import CommonLoader from "../common/Loader";
import type { RootState } from "@/store";
import { useGetProjectActivityQuery } from "@/store/api/taskApi";

export default function ActivityPanel() {
  const projectId = useSelector(
    (state: RootState) => state.project.currentProjectId
  );

  const { data, isLoading } = useGetProjectActivityQuery(projectId!, {
    skip: !projectId,
  });

  if (!projectId) return null;

  if (isLoading) return <CommonLoader />;

  const formatActivityTime = (date: string) => {
    const d = new Date(date);

    const datePart = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(d);

    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);

    return `${datePart} • ${timePart}`;
  };

  return (
    <div className="w-full lg:w-[250px] border-1 bg-background space-y-3">
      <h3 className="font-semibold text-sm">Activity</h3>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
        {data?.map((item: any) => (
          <div className="text-sm border-b pb-2 last:border-0" key={item.id}>
            <p className="font-medium">{item.username}</p>
            <p className="text-muted-foreground text-xs">{item.message}</p>

            <p className="text-xs text-muted-foreground mt-1">
              {formatActivityTime(item.createdAt)}

            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
