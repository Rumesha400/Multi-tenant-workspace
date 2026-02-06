import AppLayout from "./app/layout";
import Dashboard from "./pages/Dashboard";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Projects from "./pages/projects/Projects";
import Tasks from "./pages/tasks/Tasks";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  return (
    <>
      <Toaster position="top-right" richColors />

      {isAuthPage ?
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
        :
        <AppLayout>
          <Routes>
            <Route path="/" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute> <Projects /> </ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute> <Tasks /> </ProtectedRoute>} />
          </Routes>
        </AppLayout>
      }
    </>
  );
}

export default App;
