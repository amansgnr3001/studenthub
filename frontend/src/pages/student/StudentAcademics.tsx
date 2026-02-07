import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Eye, Calendar, Trophy, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAcademicsSSE, type AcademicRecord } from "@/hooks/useAcademicsSSE";

const StudentAcademics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState<string>("");
  
  // Get student ID from localStorage on mount
  useEffect(() => {
    const studentData = localStorage.getItem('studentData');
    if (studentData) {
      const student = JSON.parse(studentData);
      setStudentId(student.sid || "");
    }
  }, []);

  // Use SSE hook to get real-time academic records
  const { 
    academicRecords, 
    loading, 
    error, 
    isConnected 
  } = useAcademicsSSE(studentId, !!studentId);

  const handleBack = () => {
    navigate("/student/dashboard");
  };

  const handleViewPDF = (url: string, semester: number) => {
    try {
      // Open PDF in new tab
      window.open(url, '_blank');
      toast({
        title: "Opening PDF",
        description: `Opening Semester ${semester} academic record`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to open PDF file",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async (url: string, semester: number) => {
    try {
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = url;
      link.download = `academic-record-semester-${semester}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading Semester ${semester} academic record`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download PDF file",
        variant: "destructive"
      });
    }
  };

  const getSemesterOrdinal = (sem: number) => {
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    return ordinals[sem] || `${sem}th`;
  };

  const getGradeColor = (gpa: number) => {
    if (gpa >= 9) return "text-green-600";
    if (gpa >= 8) return "text-blue-600";
    if (gpa >= 7) return "text-yellow-600";
    if (gpa >= 6) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-primary">Academic Records</h1>
          </div>
        </header>
        
        <main className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading academic records...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-primary">Academic Records</h1>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Wifi className="w-4 h-4" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-6">
        {error ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-6">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </CardContent>
          </Card>
        ) : academicRecords.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-6">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Academic Records</h3>
              <p className="text-muted-foreground">
                No academic records have been uploaded for your account yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Your Academic Records ({academicRecords.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {academicRecords.map((record) => (
                <Card key={record._id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        {getSemesterOrdinal(record.sem)} Semester
                      </CardTitle>
                      <div className={`text-2xl font-bold ${getGradeColor(record.gpa)}`}>
                        {record.gpa}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Updated: {new Date(record.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Student ID: {record.sid}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewPDF(record.url, record.sem)}
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View PDF
                      </Button>
                      <Button
                        onClick={() => handleDownloadPDF(record.url, record.sem)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentAcademics;
