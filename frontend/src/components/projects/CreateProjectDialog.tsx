import { useCreateProjectMutation } from "@/store/api/projectApi";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export default function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createProject, { isLoading }] = useCreateProjectMutation();

    const handleSubmit = async () => {
        if (!name.trim()) return

        try {
            await createProject({ name, description }).unwrap();
            setOpen(false);
            setName("");
            setDescription("");
        } catch (error) {
            toast.error("Failed to create project");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    Create Project
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Textarea placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Project"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}