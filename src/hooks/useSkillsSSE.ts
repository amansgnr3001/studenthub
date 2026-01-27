import { useState, useEffect, useCallback } from 'react';

export interface SkillDocument {
  _id: string;
  sid: string;
  skillname: string;
  url?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}

export interface SkillsSSEData {
  message: string;
  totalCount: number;
  documents: SkillDocument[];
}

interface UseSkillsSSEReturn {
  skills: SkillDocument[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export const useSkillsSSE = (enabled: boolean = true): UseSkillsSSEReturn => {
  const [skills, setSkills] = useState<SkillDocument[]>([]);
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
        `http://localhost:5000/api/student/skills/stream?token=${encodeURIComponent(token)}`
      );

      eventSource.addEventListener('skills-update', (event: Event) => {
        try {
          const customEvent = event as MessageEvent;
          const data: SkillsSSEData = JSON.parse(customEvent.data);
          setSkills(data.documents);
          setIsConnected(true);
          setLoading(false);
          console.log(`📥 Received skills update: ${data.totalCount} documents`);
        } catch (parseError) {
          console.error('Error parsing skills SSE data:', parseError);
          setError('Failed to parse skills data');
        }
      });

      eventSource.addEventListener('error', (event: Event) => {
        const customEvent = event as MessageEvent;
        console.error('Skills SSE error:', customEvent);
        setIsConnected(false);
        setError('Connection lost. Retrying...');
        eventSource.close();
      });

      eventSource.onerror = () => {
        console.error('Skills EventSource connection error');
        setIsConnected(false);
        setError('Failed to connect to real-time updates');
        eventSource.close();
      };

      console.log('📡 Connected to skills SSE stream');

      // Cleanup function
      return () => {
        console.log('🔌 Closing skills SSE stream');
        eventSource.close();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to SSE stream';
      setError(errorMessage);
      setLoading(false);
      console.error('Skills SSE setup error:', err);
    }
  }, [enabled]);

  useEffect(() => {
    const cleanup = setupSSE();
    return cleanup;
  }, [setupSSE]);

  return {
    skills,
    loading,
    error,
    isConnected
  };
};
