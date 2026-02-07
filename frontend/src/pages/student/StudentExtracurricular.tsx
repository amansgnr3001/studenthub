import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementModal from "@/components/AchievementModal";
import axios from "axios";

interface ExtracurricularDocument {
  _id: string;
  sid: string;
  activities: string;
  description: string;
  url?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

interface ExtracurricularResponse {
  message: string;
  totalCount: number;
  documents: ExtracurricularDocument[];
}

const StudentExtracurricular = () => {
  const [extracurricularActivities, setExtracurricularActivities] = useState<ExtracurricularDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { 
    isModalOpen, 
    openAchievementModal,
    closeAchievementModal,
    selectAchievementType,
    submissionStatus, 
    resetSubmissionStatus 
  } = useAchievements();

  const fetchExtracurricularActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("studentToken");
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your extracurricular activities.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get<ExtracurricularResponse>("/api/student/extracurricular", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExtracurricularActivities(response.data.documents);
      
      toast({
        title: "Extracurricular Activities Loaded",
        description: `Found ${response.data.totalCount} extracurricular activity documents.`,
      });
    } catch (error) {
      console.error("Error fetching extracurricular activities:", error);
      toast({
        title: "Error",
        description: "Failed to load extracurricular activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchExtracurricularActivities();
  }, []);

  // Auto-refresh when submission status changes to 1 (submitted)
  useEffect(() => {
    if (submissionStatus === 1) {
      // Refresh data after successful submission
      fetchExtracurricularActivities();
      // Reset status back to 0
      resetSubmissionStatus();
    }
  }, [submissionStatus, resetSubmissionStatus]);

  const handleAddExtracurricular = () => {
    openAchievementModal();
    selectAchievementType("extracurriculam");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your extracurricular activities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Extracurricular Activities</h1>
          <p className="text-muted-foreground">
            Manage and track your extracurricular achievements and activities
          </p>
        </div>
        <Button onClick={handleAddExtracurricular} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Activity
        </Button>
      </div>

      {extracurricularActivities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Extracurricular Activities Added Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Start building your profile by adding your first extracurricular activity.
            </p>
            <Button onClick={handleAddExtracurricular} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Activity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {extracurricularActivities.map((activity) => (
            <Card key={activity._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{activity.activities}</CardTitle>
                  {getStatusBadge(activity.status)}
                </div>
                <CardDescription>
                  Submitted on {formatDate(activity.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>Description:</strong>
                    <p className="text-muted-foreground mt-1">{activity.description}</p>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <strong>Student ID:</strong> {activity.sid}
                  </div>
                  
                  {activity.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(activity.url, "_blank")}
                      className="flex items-center gap-2 w-full"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Document
                    </Button>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatDate(activity.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AchievementModal 
        isOpen={isModalOpen} 
        onClose={closeAchievementModal} 
      />
    </div>
  );
};

export default StudentExtracurricular;