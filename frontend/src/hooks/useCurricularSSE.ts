import { useState, useEffect, useCallback } from 'react';

export interface CurricularDocument {
  _id: string;
  sid: string;
  activities: string;
  description: string;
  url?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface CurricularSSEData {
  message: string;
  totalCount: number;
  documents: CurricularDocument[];
}

interface UseCurricularSSEReturn {
  curricularActivities: CurricularDocument[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export const useCurricularSSE = (enabled: boolean = true): UseCurricularSSEReturn => {
  const [curricularActivities, setCurricularActivities] = useState<CurricularDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setupSSE = useCallback(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem('studentToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Create EventSource with token as query parameter
      const eventSource = new EventSource(
        `/api/student/curricular/stream?token=${encodeURIComponent(token)}`
      );

      eventSource.addEventListener('curricular-update', (event: Event) => {
        try {
          const customEvent = event as MessageEvent;
          const data: CurricularSSEData = JSON.parse(customEvent.data);
          setCurricularActivities(data.documents);
          setIsConnected(true);
          setLoading(false);
          console.log(`📥 Received curricular update: ${data.totalCount} documents`);
        } catch (parseError) {
          console.error('Error parsing curricular SSE data:', parseError);
          setError('Failed to parse curricular data');
        }
      });

      eventSource.addEventListener('error', (event: Event) => {
        const customEvent = event as MessageEvent;
        console.error('Curricular SSE error:', customEvent);
        setIsConnected(false);
        setError('Connection lost. Retrying...');
        eventSource.close();
      });

      eventSource.onerror = () => {
        console.error('Curricular EventSource connection error');
        setIsConnected(false);
        setError('Failed to connect to real-time updates');
        eventSource.close();
      };

      console.log('📡 Connected to curricular SSE stream');

      // Cleanup function
      return () => {
        console.log('🔌 Closing curricular SSE stream');
        eventSource.close();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to SSE stream';
      setError(errorMessage);
      setLoading(false);
      console.error('Curricular SSE setup error:', err);
    }
  }, [enabled]);

  useEffect(() => {
    const cleanup = setupSSE();
    return cleanup;
  }, [setupSSE]);

  return {
    curricularActivities,
    loading,
    error,
    isConnected
  };
};
