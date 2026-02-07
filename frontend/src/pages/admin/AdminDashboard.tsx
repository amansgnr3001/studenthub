import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, FileText, UserCheck, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      toast({
        title: 'Authentication Required',
        description: 'Please login as admin to continue',
        variant: 'destructive',
      });
      navigate('/admin/login');
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    // Remove admin token and faculty data from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('facultyData');
    
    // Show logout success message
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Navigate to admin login page
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/admin/students")}
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              Students
            </Button>
            <Button 
              onClick={() => {
                console.log('🔘 Requests button clicked');
                console.log('🔑 Token before navigation:', localStorage.getItem('adminToken'));
                navigate("/admin/requests");
              }}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Requests
            </Button>
            <Button 
              onClick={() => navigate("/admin/student-profiles")}
              variant="outline"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Student Profiles
            </Button>
            <Button 
              onClick={handleLogout}
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Admin dashboard content will be added here</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;