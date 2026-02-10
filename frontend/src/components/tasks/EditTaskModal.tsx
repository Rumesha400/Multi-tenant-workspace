import type { Task } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import EditTaskForm from "./EditTaskForm";

interface Props {
    open: boolean;
    onClose: () => void;
    task: Task | null;
}

export default function EditTaskModal({ open, onClose, task }: Props) {
    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <EditTaskForm task={task} onSuccess={onClose} />
            </DialogContent>
        </Dialog>
    )
}