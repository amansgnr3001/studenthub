import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AcademicsProvider } from "./contexts/AcademicsContext";
import PortalSelection from "./pages/PortalSelection";
import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAcademics from "./pages/student/StudentAcademics";
import StudentSkills from "./pages/student/StudentSkills";
import StudentCurricular from "./pages/student/StudentCurricular";
import StudentExtracurricular from "./pages/student/StudentExtracurricular";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import AcademicsPage from "./pages/admin/AcademicsPage";
import RequestsPage from "./pages/admin/RequestsPage";
import StudentProfiles from "./pages/admin/StudentProfiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AcademicsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PortalSelection />} />
            
            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<StudentRegister />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/academics" element={<StudentAcademics />} />
            <Route path="/student/skills" element={<StudentSkills />} />
            <Route path="/student/curricular" element={<StudentCurricular />} />
            <Route path="/student/extracurricular" element={<StudentExtracurricular />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsPage />} />
            <Route path="/admin/academics" element={<AcademicsPage />} />
            <Route path="/admin/requests" element={<RequestsPage />} />
            <Route path="/admin/student-profiles" element={<StudentProfiles />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AcademicsProvider>
  </QueryClientProvider>
);

export default App;
