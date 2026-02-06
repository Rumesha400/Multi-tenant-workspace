import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export const useAuth = () => {
  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  return { token, isAuthenticated };
};
