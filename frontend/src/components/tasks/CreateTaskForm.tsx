import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useCreateTaskMutation } from "@/store/api/taskApi";
import type { RootState } from "@/store";

/* ---------------- Schema ---------------- */

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type FormData = z.infer<typeof schema>;

/* ---------------- Component ---------------- */

interface Props {
    onSuccess: () => void;
}

export default function CreateTaskForm({ onSuccess }: Props) {
    const projectId = useSelector(
        (state: RootState) => state.project.currentProjectId
    );

    const [createTask, { isLoading }] = useCreateTaskMutation();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            priority: "MEDIUM",
        },
    });

    const onSubmit = async (data: FormData) => {
        if (!projectId) {
            toast.error("Select project first");
            return;
        }

        try {
            await createTask({
                projectId,
                ...data,
            }).unwrap();

            toast.success("Task created");

            form.reset();
            onSuccess();
        } catch (err: any) {
            toast.error(err?.data?.detail || "Failed to create task");
        }
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
        >
            {/* Title */}
            <div>
                <Input
                    placeholder="Task title"
                    {...form.register("title")}
                />
                <p className="text-sm text-red-500">
                    {form.formState.errors.title?.message}
                </p>
            </div>

            {/* Description */}
            <div>
                <Textarea
                    placeholder="Description"
                    {...form.register("description")}
                />
            </div>

            {/* Priority */}
            <Select
                defaultValue="MEDIUM"
                onValueChange={(v) =>
                    form.setValue("priority", v as any)
                }
            >
                <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating..." : "Create"}
                </Button>
            </div>
        </form>
    );
}
