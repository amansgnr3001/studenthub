import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, FileText, Calendar, Building, Briefcase, Award, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type definitions for documents from API
interface DocumentBase {
  _id: string;
  sid: string;
  url: string;
  status: "pending" | "accepted" | "rejected";
  documentType: string;
  title: string;
  subtitle: string;
  createdAt?: string;
}

interface StudentInfo {
  sid: string;
  name?: string;
  email?: string;
}

interface PendingDocumentsResponse {
  message: string;
  totalCount: number;
  breakdown: {
    curriculam: number;
    extracurriculam: number;
    internships: number;
    placements: number;
    skills: number;
  };
  documents: DocumentBase[];
}

const RequestsPage = () => {
  console.log('🎯🎯🎯 REQUESTSPAGE COMPONENT IS RENDERING 🎯🎯🎯');
  console.log('🔑 Token at component start:', localStorage.getItem('adminToken'));
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentBase[]>([]);
  const [studentMap, setStudentMap] = useState<{[key: string]: StudentInfo}>({});
  const [totalCount, setTotalCount] = useState(0);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const previousCountRef = useRef<number>(0);

  // Check admin authentication
  useEffect(() => {
    console.log('🔐 Auth Check useEffect Running');
    const adminToken = localStorage.getItem('adminToken');
    console.log('🌐 Origin:', window.location.origin);
    console.log('📋 Token exists:', !!adminToken);
    console.log('📋 Token value:', adminToken);

    if (!adminToken) {
      console.log('❌ NO TOKEN FOUND - Redirecting to login');
      toast({
        title: 'Authentication Required',
        description: 'Please login as admin to access this page',
        variant: 'destructive',
      });
      // Redirect to login instead of showing error
      navigate('/admin/login');
    } else {
      console.log('✅ TOKEN EXISTS - User is authenticated');
    }
  }, [toast, navigate]);

  // Setup SSE connection for real-time updates
  useEffect(() => {
    console.log('🔍 SSE useEffect Running');

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      console.log('⚠️ No token, skipping SSE connection');
      return;
    }

    const connectSSE = () => {
      console.log('🔌 Connecting to SSE...');

      const streamUrl = `/api/admin/pending-documents/stream?token=${encodeURIComponent(adminToken)}`;
      const eventSource = new EventSource(streamUrl);

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ SSE Connected');
        setIsLiveConnected(true);
      };

      eventSource.addEventListener('pending-documents', (event) => {
        try {
          const data: PendingDocumentsResponse = JSON.parse(event.data);
          console.log('📨 Received:', data.totalCount, 'documents');
          
          setDocuments(data.documents);
          setTotalCount(data.totalCount);
          setLoading(false);

          const uniqueSids = [...new Set(data.documents.map((doc: DocumentBase) => doc.sid))];
          const initialStudentMap: {[key: string]: StudentInfo} = {};
          uniqueSids.forEach((sid: string) => {
            initialStudentMap[sid] = { sid };
          });
          setStudentMap(initialStudentMap);

          if (previousCountRef.current > 0 && data.totalCount !== previousCountRef.current) {
            const diff = data.totalCount - previousCountRef.current;
            if (diff > 0) {
              toast({
                title: "🔔 New Pending Requests",
                description: `${diff} new ${diff === 1 ? 'request' : 'requests'}`,
                duration: 5000,
              });
            }
          }
          
          previousCountRef.current = data.totalCount;
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      });

      eventSource.onerror = (error) => {
        console.error('❌ SSE Error:', error);
        setIsLiveConnected(false);
        setLoading(false);
        
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            console.log('🔄 Reconnecting SSE...');
            connectSSE();
          }
        }, 5000);
      };
    };

    connectSSE();

    return () => {
      console.log('🧹 Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [toast]);

  const handleRequestAction = async (doc: DocumentBase, newStatus: "accepted" | "rejected") => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      toast({
        title: 'Authentication Required',
        description: 'Please login as admin to perform this action',
        variant: 'destructive',
      });
      navigate('/admin/login');
      return;
    }

    if (newStatus === 'rejected') {
      const reason = window.prompt('Enter rejection reason/description:', '');
      if (reason === null) return; // user cancelled
      if (!reason.trim()) {
        toast({
          title: 'Description required',
          description: 'Please enter a rejection description.',
          variant: 'destructive',
        });
        return;
      }

      if (actionLoadingIds.has(doc._id)) return;

      setActionLoadingIds(prev => {
        const next = new Set(prev);
        next.add(doc._id);
        return next;
      });

      try {
        const response = await fetch('/api/skills/reject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            sid: doc.sid,
            url: doc.url,
            documentType: doc.documentType,
            description: reason.trim(),
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const errorMessage = (data as any)?.error || 'Failed to reject document';
          throw new Error(errorMessage);
        }

        setDocuments(prev => prev.filter(d => d._id !== doc._id));
        setTotalCount(prev => Math.max(0, prev - 1));

        toast({
          title: '❌ Request Rejected',
          description: (data as any)?.message || 'successfully rejected',
          duration: 3000,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reject document';
        toast({
          title: '❌ Reject failed',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setActionLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(doc._id);
          return next;
        });
      }

      return;
    }

    if (actionLoadingIds.has(doc._id)) return;

    setActionLoadingIds(prev => {
      const next = new Set(prev);
      next.add(doc._id);
      return next;
    });

    try {
      const response = await fetch('/api/skills/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          sid: doc.sid,
          url: doc.url,
          documentType: doc.documentType,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage = (data as any)?.error || 'Failed to accept document';
        throw new Error(errorMessage);
      }

      setDocuments(prev => prev.filter(d => d._id !== doc._id));
      setTotalCount(prev => Math.max(0, prev - 1));

      toast({
        title: '✅ Request Approved',
        description: (data as any)?.message || 'successfully accepted',
        duration: 3000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept document';
      toast({
        title: '❌ Accept failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setActionLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(doc._id);
        return next;
      });
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case "curriculam":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "extracurriculam":
        return <Calendar className="w-5 h-5 text-indigo-500" />;
      case "internship":
        return <Briefcase className="w-5 h-5 text-green-500" />;
      case "placement":
        return <Building className="w-5 h-5 text-purple-500" />;
      case "skill":
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDocumentTypeLabel = (documentType: string) => {
    switch (documentType) {
      case "curriculam":
        return "Curricular Activity";
      case "extracurriculam":
        return "Extracurricular Activity";
      case "internship":
        return "Internship";
      case "placement":
        return "Placement";
      case "skill":
        return "Skill Certificate";
      default:
        return "Document";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to server...</p>
          <p className="text-sm text-muted-foreground mt-2">Waiting for data...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-primary">Pending Requests</h1>
          
          <div className="ml-auto flex items-center gap-2">
            {isLiveConnected ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <Wifi className="w-3 h-3 mr-1" />
                Live Updates
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-500">
                <WifiOff className="w-3 h-3 mr-1" />
                Connecting...
              </Badge>
            )}
            
            {documents.length > 0 && (
              <Badge variant="outline">
                {documents.length} {documents.length === 1 ? 'request' : 'requests'}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc._id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.documentType)}
                      <div>
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <p className="text-muted-foreground text-sm">
                          {getDocumentTypeLabel(doc.documentType)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Student ID: {doc.sid}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doc.subtitle && (
                    <div>
                      <p className="text-muted-foreground">{doc.subtitle}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Submitted on: {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-0">
                  {doc.url && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => openDocument(doc.url)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
                  )}
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRequestAction(doc, "accepted")}
                      disabled={actionLoadingIds.has(doc._id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {actionLoadingIds.has(doc._id) ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRequestAction(doc, "rejected")}
                      disabled={actionLoadingIds.has(doc._id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {documents.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-16">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg">No pending requests</h3>
            <p className="mt-1">All student submitted documents have been processed</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestsPage;