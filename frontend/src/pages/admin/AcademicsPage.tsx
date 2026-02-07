import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAcademics } from "@/contexts/AcademicsContext";

const AcademicsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAcademicsSubmitted } = useAcademics();
  
  const [formData, setFormData] = useState({
    sid: "",
    sem: "",
    gpa: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a PDF file only."
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 5MB."
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const validateForm = () => {
    const { sid, sem, gpa } = formData;
    
    if (!sid.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Student ID is required."
      });
      return false;
    }

    const semesterNum = parseInt(sem);
    if (!sem || semesterNum < 1 || semesterNum > 8) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Semester must be between 1 and 8."
      });
      return false;
    }

    const gpaNum = parseFloat(gpa);
    if (!gpa || gpaNum < 0 || gpaNum > 10) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "GPA must be between 0 and 10."
      });
      return false;
    }

    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a PDF file."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please login again."
        });
        navigate('/admin/login');
        return;
      }

      const submitData = new FormData();
      submitData.append('sid', formData.sid);
      submitData.append('sem', formData.sem);
      submitData.append('gpa', formData.gpa);
      submitData.append('pdfFile', selectedFile!);

      const response = await fetch('/api/academics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Academic record uploaded successfully!"
        });
        
        // Set academics submitted to 1 on successful upload (201 status)
        setAcademicsSubmitted(1);
        
        // Reset form
        setFormData({ sid: "", sem: "", gpa: "" });
        setSelectedFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: result.error || "Failed to upload academic record."
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/students")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
          <h1 className="text-2xl font-bold text-primary">Academic Records</h1>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Academic Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student ID Field */}
                <div className="space-y-2">
                  <Label htmlFor="sid">Student ID</Label>
                  <Input
                    id="sid"
                    name="sid"
                    placeholder="Enter student ID or roll number"
                    value={formData.sid}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Semester Field */}
                <div className="space-y-2">
                  <Label htmlFor="sem">Semester</Label>
                  <Input
                    id="sem"
                    name="sem"
                    type="number"
                    min="1"
                    max="8"
                    placeholder="Enter semester (1-8)"
                    value={formData.sem}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* GPA Field */}
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    name="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="Enter GPA (0-10)"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* PDF Upload Field */}
                <div className="space-y-2">
                  <Label htmlFor="pdfFile">Academic Record PDF</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pdfFile"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      required
                    />
                    {selectedFile && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only PDF files are allowed. Maximum size: 5MB
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Academic Record
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AcademicsPage;
