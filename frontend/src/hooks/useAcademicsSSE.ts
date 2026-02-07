import { useState, useEffect, useCallback } from 'react';

export interface AcademicRecord {
  _id: string;
  sid: string;
  gpa: number;
  url: string;
  sem: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicsSSEData {
  message: string;
  sid: string;
  count: number;
  records: AcademicRecord[];
}

interface UseAcademicsSSEReturn {
  academicRecords: AcademicRecord[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export const useAcademicsSSE = (studentId: string, enabled: boolean = true): UseAcademicsSSEReturn => {
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setupSSE = useCallback(() => {
    if (!enabled || !studentId) {
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
        `/api/student/academics/stream/${studentId}?token=${encodeURIComponent(token)}`
      );

      eventSource.addEventListener('academics-update', (event: Event) => {
        try {
          const customEvent = event as MessageEvent;
          const data: AcademicsSSEData = JSON.parse(customEvent.data);
          setAcademicRecords(data.records);
          setIsConnected(true);
          setLoading(false);
          console.log(`📥 Received academics update for ${studentId}: ${data.count} records`);
        } catch (parseError) {
          console.error('Error parsing academics SSE data:', parseError);
          setError('Failed to parse academic data');
        }
      });

      eventSource.addEventListener('error', (event: Event) => {
        const customEvent = event as MessageEvent;
        console.error('Academics SSE error:', customEvent);
        setIsConnected(false);
        setError('Connection lost. Retrying...');
        eventSource.close();
      });

      eventSource.onerror = () => {
        console.error('Academics EventSource connection error');
        setIsConnected(false);
        setError('Failed to connect to real-time updates');
        eventSource.close();
      };

      console.log(`📡 Connected to academics SSE stream for ${studentId}`);

      // Cleanup function
      return () => {
        console.log(`🔌 Closing academics SSE stream for ${studentId}`);
        eventSource.close();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to SSE stream';
      setError(errorMessage);
      setLoading(false);
      console.error('Academics SSE setup error:', err);
    }
  }, [studentId, enabled]);

  useEffect(() => {
    const cleanup = setupSSE();
    return cleanup;
  }, [setupSSE]);

  return {
    academicRecords,
    loading,
    error,
    isConnected
  };
};
