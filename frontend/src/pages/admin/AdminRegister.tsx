import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    facultyname: "",
    facultyid: "",
    emailid: "",
    pass: "",
    confirmPassword: ""
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.pass !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API (exclude confirmPassword)
      const registrationData = {
        facultyname: formData.facultyname,
        facultyid: formData.facultyid,
        emailid: formData.emailid,
        pass: formData.pass
      };

      // Call the backend API
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin token and faculty data in localStorage
        localStorage.setItem('adminToken', data.adminToken);
        localStorage.setItem('facultyData', JSON.stringify(data.facultyData));

        toast({
          title: "Success",
          description: "Admin registration successful!",
        });

        // Navigate to admin dashboard
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "An error occurred during registration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Admin Registration</CardTitle>
            <CardDescription>
              Create your admin account to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facultyname">Faculty Name</Label>
                <Input
                  id="facultyname"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.facultyname}
                  onChange={(e) => handleChange("facultyname", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facultyid">Faculty ID</Label>
                <Input
                  id="facultyid"
                  type="text"
                  placeholder="Enter your faculty ID"
                  value={formData.facultyid}
                  onChange={(e) => handleChange("facultyid", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailid">Email</Label>
                <Input
                  id="emailid"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.emailid}
                  onChange={(e) => handleChange("emailid", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass">Password</Label>
                <Input
                  id="pass"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.pass}
                  onChange={(e) => handleChange("pass", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Admin Account"}
              </Button>
            </form>
            
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/admin/login" className="text-green-600 hover:underline">
                  Login here
                </Link>
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Portal Selection
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegister;
