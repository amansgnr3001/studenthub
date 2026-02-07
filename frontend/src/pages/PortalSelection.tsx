import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student Hub Connect
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Choose your portal to access the system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-700">Student Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Access your academic records, skills, internships, and placements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">✓ View academic performance</p>
                <p className="text-sm text-gray-600">✓ Manage skills and certifications</p>
                <p className="text-sm text-gray-600">✓ Track internship applications</p>
                <p className="text-sm text-gray-600">✓ Monitor placement status</p>
              </div>
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/student/login")}
                >
                  Student Login
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/student/register")}
                >
                  Student Register
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Admin Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Manage students, approve requests, and oversee academic activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">✓ Manage student profiles</p>
                <p className="text-sm text-gray-600">✓ Approve/reject requests</p>
                <p className="text-sm text-gray-600">✓ Monitor academic progress</p>
                <p className="text-sm text-gray-600">✓ Generate reports</p>
              </div>
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/admin/login")}
                >
                  Admin Login
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => navigate("/admin/register")}
                >
                  Admin Register
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Having trouble accessing your account? Contact support at support@studenthub.edu
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
