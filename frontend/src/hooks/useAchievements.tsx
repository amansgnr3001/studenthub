import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Types for achievement options
export type AchievementType = "inters" | "curriculam" | "extracurriculam" | "placed" | "skill";

// Mapping from frontend labels to backend keys
const ACHIEVEMENT_TYPE_MAPPING: Record<AchievementType, string> = {
  inters: "internship",
  curriculam: "curriculam",
  extracurriculam: "extracurriculam", 
  placed: "placement",
  skill: "skill"
};

// Types for form data based on schemas
export interface InternshipFormData {
  companyname: string;
  duration: string;
  companytype: "government" | "private";
  pdfFile?: File;
}

export interface CurricularFormData {
  activities: string;
  description: string;
  pdfFile?: File;
}

export interface ExtracurricularFormData {
  activities: string;
  description: string;
  pdfFile?: File;
}

export interface PlacementFormData {
  companyname: string;
  companytype: "government" | "private";
  pdfFile?: File;
}

export interface SkillFormData {
  skillname: string;
  pdfFile?: File;
}

export type AchievementFormData = 
  | InternshipFormData 
  | CurricularFormData 
  | ExtracurricularFormData 
  | PlacementFormData 
  | SkillFormData;

// Achievement options for dropdown
export const ACHIEVEMENT_OPTIONS = [
  { value: "inters" as AchievementType, label: "Internship", icon: "💼" },
  { value: "curriculam" as AchievementType, label: "Curricular Activity", icon: "📚" },
  { value: "extracurriculam" as AchievementType, label: "Extracurricular Activity", icon: "🎭" },
  { value: "placed" as AchievementType, label: "Placement", icon: "🏢" },
  { value: "skill" as AchievementType, label: "Skill Certificate", icon: "🏆" }
];

export const useAchievements = () => {
  const [selectedType, setSelectedType] = useState<AchievementType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(0); // 0: not submitted, 1: submitted
  const { toast } = useToast();

  // Get student token from localStorage
  const getStudentToken = () => {
    try {
      // Token is stored separately, not inside studentData
      const token = localStorage.getItem("studentToken");
      return token;
    } catch (error) {
      console.error("Error getting student token:", error);
      return null;
    }
  };

  // Open achievement modal
  const openAchievementModal = () => {
    setIsModalOpen(true);
    setSelectedType(null);
  };

  // Close achievement modal
  const closeAchievementModal = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };

  // Select achievement type
  const selectAchievementType = (type: AchievementType) => {
    setSelectedType(type);
  };

  // Submit achievement form
  const submitAchievement = async (formData: AchievementFormData) => {
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select an achievement type",
        variant: "destructive"
      });
      return false;
    }

    const studentToken = getStudentToken();
    if (!studentToken) {
      toast({
        title: "Authentication Error",
        description: "Please login again to submit achievements",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for API
      const apiFormData = new FormData();
      const backendKey = ACHIEVEMENT_TYPE_MAPPING[selectedType];
      
      console.log("Submitting achievement:", {
        selectedType,
        backendKey,
        formData: Object.keys(formData),
        hasToken: !!studentToken
      });
      
      apiFormData.append('key', backendKey);

      // Add fields based on achievement type
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'pdfFile' && value instanceof File) {
          apiFormData.append('pdfFile', value);
          console.log("Adding PDF file:", value.name);
        } else if (key !== 'pdfFile' && value !== undefined) {
          apiFormData.append(key, value as string);
          console.log("Adding field:", key, "=", value);
        }
      });

      // Submit to API
      console.log("Making API call to:", "/api/student/submit-document");
      const response = await axios.post(
        "/api/student/submit-document",
        apiFormData,
        {
          headers: {
            Authorization: `Bearer ${studentToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log("API Response:", response.data);

      if (response.data) {
        toast({
          title: "Success!",
          description: `${ACHIEVEMENT_OPTIONS.find(opt => opt.value === selectedType)?.label} submitted successfully`,
        });
        
        // Update submission status to 1 to trigger data retrieval
        setSubmissionStatus(1);
        
        // Reset form and close modal
        closeAchievementModal();
        return true;
      }
    } catch (error: any) {
      console.error("Achievement submission error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "Failed to submit achievement";
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }

    return false;
  };

  // Get form fields for selected achievement type
  const getFormFields = (type: AchievementType) => {
    switch (type) {
      case "inters":
        return {
          fields: [
            { name: "companyname", label: "Company Name", type: "text", required: true },
            { name: "duration", label: "Duration", type: "text", required: true },
            { name: "companytype", label: "Company Type", type: "select", options: ["government", "private"], required: true }
          ],
          pdfRequired: true
        };
      
      case "curriculam":
        return {
          fields: [
            { name: "activities", label: "Activity", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea", required: true }
          ],
          pdfRequired: false
        };
      
      case "extracurriculam":
        return {
          fields: [
            { name: "activities", label: "Activity", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea", required: true }
          ],
          pdfRequired: false
        };
      
      case "placed":
        return {
          fields: [
            { name: "companyname", label: "Company Name", type: "text", required: true },
            { name: "companytype", label: "Company Type", type: "select", options: ["government", "private"], required: true }
          ],
          pdfRequired: true
        };
      
      case "skill":
        return {
          fields: [
            { name: "skillname", label: "Skill Name", type: "text", required: true }
          ],
          pdfRequired: true
        };
      
      default:
        return { fields: [], pdfRequired: false };
    }
  };

  // Reset submission status
  const resetSubmissionStatus = () => {
    setSubmissionStatus(0);
  };

  return {
    selectedType,
    isSubmitting,
    isModalOpen,
    submissionStatus,
    setSubmissionStatus,
    resetSubmissionStatus,
    openAchievementModal,
    closeAchievementModal,
    selectAchievementType,
    submitAchievement,
    getFormFields,
    achievementOptions: ACHIEVEMENT_OPTIONS
  };
};