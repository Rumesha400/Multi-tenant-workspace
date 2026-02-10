export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  orgId: string;
  createdBy: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  projectId: string;
  orgId: string;
  createdBy: string;
  assigneeId?: string;
  labels: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
  priorityWeight: number;
  isDeleted: boolean;
  isArchived: boolean;
  isOverdue: boolean;
  createdAt: string;
}

export interface ProjectMember {
  name: string;
  email: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiErrorResponse {
    status: number;
    data: {
        detail: string;
    };
}

export interface KanbanBoardProps {
  tasks: any[];
}

export interface KanbanColumnProps {
    status: string;
    tasks: any[];
}

export interface KanbanCardProps {
    task: any;
}