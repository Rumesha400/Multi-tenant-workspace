import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useUpdateTaskMutation } from "@/store/api/taskApi";
import { toast } from "sonner";
import type { Task } from "@/types";
import { useApiError } from "@/hooks/useApiError";

const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
    task: Task;
    onSuccess: () => void;
}

export default function EditTaskForm({ task, onSuccess }: Props) {
    const [updateTask, { isLoading, error }] = useUpdateTaskMutation();
    const getErrorMessage = useApiError();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            await updateTask({
                id: task.id,
                data,
            }).unwrap();

            toast.success("Task updated");
            onSuccess();
        } catch {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
        >
            <Input {...form.register("title")} />

            <Textarea {...form.register("description")} />

            <select
                {...form.register("status")}
                className="w-full border rounded p-2"
            >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
            </select>

            <select
                {...form.register("priority")}
                className="w-full border rounded p-2"
            >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
            </select>

            <Button disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
            </Button>
        </form>
    );
}
