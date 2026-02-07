import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Search, User } from "lucide-react";

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  course: string;
  year: string;
  gpa: number;
}

const StudentProfiles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  // Dummy student profiles data
  const studentProfiles: StudentProfile[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      course: "Computer Science",
      year: "3rd Year",
      gpa: 3.8
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      course: "Mathematics",
      year: "2nd Year", 
      gpa: 3.9
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice@example.com",
      course: "Physics",
      year: "4th Year",
      gpa: 3.7
    },
    {
      id: 4,
      name: "Bob Wilson",
      email: "bob@example.com",
      course: "Computer Science",
      year: "1st Year",
      gpa: 3.6
    },
  ];

  const filteredProfiles = studentProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !selectedFilter || selectedFilter === "all" || profile.course === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/dashboard")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-primary">Student Profiles</h1>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Search and Filter */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Course:</p>
                  <p className="text-primary">{profile.course}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Year:</p>
                  <p className="text-muted-foreground">{profile.year}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">GPA:</p>
                  <p className="text-success font-semibold">{profile.gpa}</p>
                </div>
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No student profiles found matching your search criteria.
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentProfiles;