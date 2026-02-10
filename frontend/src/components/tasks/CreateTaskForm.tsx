// frontend\src\components\tasks\CreateTaskForm.tsx

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
import { useState } from "react";
import { useGetProjectMembersQuery } from "@/store/api/projectApi";

/* ---------------- Schema ---------------- */

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type FormData = z.infer<typeof schema>;
type Priority = z.infer<typeof schema>["priority"];

/* ---------------- Component ---------------- */

interface Props {
  onSuccess: () => void;
}

export default function CreateTaskForm({ onSuccess }: Props) {
  const projectId = useSelector(
    (state: RootState) => state.project.currentProjectId,
  );

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [labelsInput, setLabelsInput] = useState<string>("");

  const { data: members, isLoading: membersLoading } =
    useGetProjectMembersQuery(projectId!, { skip: !projectId });

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

    const labels = labelsInput
      .split(",")
      .map((label) => label.trim())
      .filter((label) => label.length > 0);

    try {
      await createTask({
        projectId,
        ...data,
        assigneeId: assigneeId || undefined,
        labels: labels.length > 0 ? labels : undefined,
      }).unwrap();

      toast.success("Task created");

      form.reset();
      setLabelsInput("");
      onSuccess();
    } catch (error) {
      console.error("Failed to create Task", error);
      toast.error("Failed to create task");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <Input placeholder="Task title" {...form.register("title")} />
        <p className="text-sm text-red-500">
          {form.formState.errors.title?.message}
        </p>
      </div>

      {/* Description */}
      <div>
        <Textarea placeholder="Description" {...form.register("description")} />
      </div>

      {/* Priority */}
      <Select
        defaultValue="MEDIUM"
        onValueChange={(v: Priority) => form.setValue("priority", v)}
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

      {/* Labels */}
      <div>
        <label className="text-sm font-medium">Labels</label>
        <Input
          placeholder='Enter labels separated by commas (e.g., "bug, backend, urgent")'
          value={labelsInput}
          onChange={(e) => setLabelsInput(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate multiple labels with commas
        </p>
      </div>

      {/* Assign To */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Assign To</label>

        <Select
          value={assigneeId ?? ""}
          onValueChange={(val) => setAssigneeId(val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select member" />
          </SelectTrigger>

          <SelectContent>
            {members?.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.name} ({member.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading || membersLoading}>
          {isLoading || membersLoading ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}
