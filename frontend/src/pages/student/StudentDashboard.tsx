import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Target, Users, Plus, User, LogOut, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAcademics } from "@/contexts/AcademicsContext";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementModal from "@/components/AchievementModal";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { academicsSubmitted } = useAcademics();
  const { openAchievementModal, isModalOpen, closeAchievementModal } = useAchievements();

  const handleViewProfile = () => {
    // Dummy functionality
    alert("View Profile - Feature coming soon!");
  };

  const handleLogout = () => {
    // Remove student token and data from localStorage
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    
    // Show logout success message
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Navigate to student login page
    navigate("/student/login");
  };

  const handleAddAchievement = () => {
    openAchievementModal();
  };

  const handleCardClick = (cardName: string) => {
    switch (cardName) {
      case "Academics":
        navigate("/student/academics");
        break;
      case "Skills":
        navigate("/student/skills");
        break;
      case "Curriculum":
        navigate("/student/curricular");
        break;
      case "Extracurricular":
        navigate("/student/extracurricular");
        break;
      default:
        // Fallback for any other cards
        alert(`${cardName} - Feature coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Student Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={handleViewProfile} variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              View Profile
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-primary" />
                Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">85.5%</div>
              <p className="text-muted-foreground text-sm">Overall GPA</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-success" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">92%</div>
              <p className="text-muted-foreground text-sm">This semester</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Academics")}
          >
            <CardHeader className="text-center">
              <div className="relative">
                <GraduationCap className="w-12 h-12 mx-auto text-primary mb-2" />
                {academicsSubmitted === 1 && (
                  <CheckCircle className="w-5 h-5 absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                )}
              </div>
              <CardTitle>Academics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                Course materials and academic resources
              </p>
              {academicsSubmitted === 1 && (
                <p className="text-center text-green-600 text-xs mt-2 font-medium">
                  ✓ Records Updated
                </p>
              )}
            </CardContent>
          </Card>

          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Skills")}
          >
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto text-warning mb-2" />
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                Track and develop your skills
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Curriculum")}
          >
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 mx-auto text-success mb-2" />
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                View curriculum and course structure
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Extracurricular")}
          >
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-destructive mb-2" />
              <CardTitle>Extracurricular</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                Activities and events participation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Achievement Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleAddAchievement} size="lg" className="shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            Add Achievement
          </Button>
        </div>
      </main>

      {/* Achievement Modal */}
      <AchievementModal 
        isOpen={isModalOpen} 
        onClose={closeAchievementModal} 
      />
    </div>
  );
};

export default StudentDashboard;