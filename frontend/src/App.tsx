import AppLayout from "./app/layout";
import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Projects from "./pages/projects/Projects";
import Tasks from "./pages/tasks/tasks";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
