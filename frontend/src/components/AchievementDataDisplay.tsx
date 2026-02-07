import { useEffect, useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import axios from "axios";

// Example component showing how to use submissionStatus to trigger data retrieval
const AchievementDataDisplay = () => {
  const { submissionStatus, resetSubmissionStatus } = useAchievements();
  const [achievementData, setAchievementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get student token from localStorage
  const getStudentToken = () => {
    try {
      const token = localStorage.getItem("studentToken");
      return token;
    } catch (error) {
      console.error("Error getting student token:", error);
      return null;
    }
  };

  // Function to fetch all achievement data
  const fetchAllAchievementData = async () => {
    const studentToken = getStudentToken();
    if (!studentToken) return;

    setLoading(true);
    try {
      // Fetch data from all achievement endpoints
      const [internships, extracurricular, placements, skills] = await Promise.all([
        axios.get<{documents: any[]}>("/api/student/internships", {
          headers: { Authorization: `Bearer ${studentToken}` }
        }),
        axios.get<{documents: any[]}>("/api/student/extracurricular", {
          headers: { Authorization: `Bearer ${studentToken}` }
        }),
        axios.get<{documents: any[]}>("/api/student/placements", {
          headers: { Authorization: `Bearer ${studentToken}` }
        }),
        axios.get<{documents: any[]}>("/api/student/skills", {
          headers: { Authorization: `Bearer ${studentToken}` }
        })
      ]);

      // Combine all data with type labels
      const combinedData = [
        ...internships.data.documents.map((doc: any) => ({ ...doc, type: 'internship' })),
        ...extracurricular.data.documents.map((doc: any) => ({ ...doc, type: 'extracurricular' })),
        ...placements.data.documents.map((doc: any) => ({ ...doc, type: 'placement' })),
        ...skills.data.documents.map((doc: any) => ({ ...doc, type: 'skill' }))
      ];

      setAchievementData(combinedData);
      
      // Reset submission status after fetching data
      resetSubmissionStatus();
      
    } catch (error) {
      console.error("Error fetching achievement data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to watch submissionStatus and trigger data fetch
  useEffect(() => {
    if (submissionStatus === 1) {
      console.log("Submission detected, fetching updated achievement data...");
      fetchAllAchievementData();
    }
  }, [submissionStatus]);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchAllAchievementData();
  }, []);

  if (loading) {
    return <div>Loading achievement data...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Achievements</h3>
      <p className="text-sm text-muted-foreground">
        Total achievements: {achievementData.length}
      </p>
      
      {achievementData.length === 0 ? (
        <p className="text-muted-foreground">No achievements submitted yet.</p>
      ) : (
        <div className="grid gap-4">
          {achievementData.map((achievement, index) => (
            <div key={index} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {achievement.type === 'internship' && achievement.companyname}
                    {achievement.type === 'placement' && achievement.companyname}
                    {achievement.type === 'skill' && achievement.skillname}
                    {(achievement.type === 'extracurricular') && achievement.activities}
                  </h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {achievement.type}
                  </p>
                  <p className="text-sm">
                    Status: <span className={`font-medium ${
                      achievement.status === 'accepted' ? 'text-green-600' :
                      achievement.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {achievement.status || 'pending'}
                    </span>
                  </p>
                </div>
                {achievement.url && (
                  <button
                    onClick={() => window.open(achievement.url, '_blank')}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Document
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementDataDisplay;