import type { AppDispatch } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const handleApiError = (error: any, dispatch: AppDispatch) => {
  const status = error?.status;
  const navigate = useNavigate();
  const message =
    error?.data?.message || error?.data?.detail || "Something went wrong";

  if (status === 401) {
    toast.error("Session expired", { duration: 1000 });
    console.log("abcdfghijklmnopqrstuvwxyz");
    dispatch(logout());
    navigate("/login");
    return;
  }

  if (status === 403) {
    toast.error("You don't have permission", { duration: 1000 });
    return;
  }

  toast.error(message, { duration: 1000 });
};
