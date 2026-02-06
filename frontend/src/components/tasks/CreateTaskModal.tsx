import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./CreateTaskForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateTaskModal() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>+ New Task</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>

                <CreateTaskForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
