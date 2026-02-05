import CommonLoader from "@/components/common/Loader";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { useGetProjectsQuery } from "@/store/api/projectApi";
import { setProject } from "@/store/slices/projectSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Projects() {
    const { data, isLoading, error } = useGetProjectsQuery();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (error) {
        return <div>Error: Failed to load projects</div>
    }

    return (isLoading ? <CommonLoader /> : (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Projects</h1>
                <CreateProjectDialog />
            </div>
            <div className="grid gap-4">
                {data?.map((project: any) => (
                    <div key={project.id} className="p-4 border rounded-lg hover:bg-muted cursor-pointer" onClick={() => {
                        console.log(project, "project name a");

                        dispatch(setProject({
                            id: project.id,
                            name: project.name,
                        }));
                        navigate(`/`);
                    }}>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                ))}
            </div>
        </div>
    ))
}