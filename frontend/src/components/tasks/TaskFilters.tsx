import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Props {
    search: string;
    setSearch: (v: string) => void;

    status: string | null;
    setStatus: (v: string | null) => void;

    priority: string | null;
    setPriority: (v: string | null) => void;

    onReset: () => void;
}

export default function TaskFilters({ search, setSearch, status, setStatus, priority, setPriority, onReset }: Props) {
    return (
        <div className="flex flex-wrap gap-3 items-center mb-4">
            {/* Search */}
            <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[220px]"
            />

            {/* Status */}
            <Select
                value={status ?? ""}
                onValueChange={(v) => setStatus(v || null)}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
            </Select>

            {/* Priority */}
            <Select
                value={priority ?? ""}
                onValueChange={(v) => setPriority(v || null)}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
            </Select>

            {/* Reset */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
            >
                Reset
            </Button>
        </div>
    )
}